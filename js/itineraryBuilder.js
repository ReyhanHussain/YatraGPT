// itineraryBuilder.js - Handles the itinerary building functionality
import aiService from './aiServices.js';
import ItineraryPdfExport from './itineraryPdfExport.js';

// Initialize interest tags functionality
const initInterestsTagSystem = () => {
    const addInterestInput = document.getElementById('add-interest');
    const interestsContainer = document.querySelector('.interests-container');

    if (addInterestInput) {
        addInterestInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
                addInterestTag(this.value.trim(), interestsContainer, addInterestInput);
                this.value = '';
            }
        });
    }

    // Add event listeners to remove interest tags
    document.querySelectorAll('.interest-tag i').forEach(icon => {
        icon.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
};

// Function to add a new interest tag
const addInterestTag = (interest, container, inputElement) => {
    const tag = document.createElement('div');
    tag.className = 'interest-tag';
    tag.innerHTML = `${interest} <i class="fas fa-times"></i>`;
    
    tag.querySelector('i').addEventListener('click', function() {
        tag.remove();
    });
    
    container.insertBefore(tag, inputElement);
};

// Simple function to remove asterisks from text
const removeAsterisks = (text) => {
    return text ? text.replace(/\*\*/g, '') : '';
};

// Store current itinerary data for download
let currentItinerary = null;

// Update the itinerary preview with generated data
const updateItineraryPreviewFromData = (itinerary) => {
    const itineraryPreview = document.querySelector('.itinerary-preview');
    if (!itineraryPreview) return;
    
    // Store the current itinerary for download
    currentItinerary = itinerary;
    
    // Change preview style to a cleaner interface for generated content
    itineraryPreview.classList.add('generated');
    
    const previewHeader = itineraryPreview.querySelector('.preview-header');
    const previewDays = itineraryPreview.querySelector('.preview-days');
    
    // Add itinerary destination and download button
    previewHeader.innerHTML = `
        <h3>Your Cultural Journey</h3>
        <p>${itinerary.destination}</p>
        <button class="btn secondary download-btn">
            <i class="fas fa-file-pdf"></i> Download PDF
        </button>
    `;
    
    // Clear existing content
    previewDays.innerHTML = '';
    
    // Add each day with all activities visible
    itinerary.days.forEach((day, index) => {
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';
        
        let activitiesHTML = '';
        
        // Clean day title of any asterisks
        const cleanDayTitle = removeAsterisks(day.title);
        
        // Handle activities as an object with properties (morning, lunch, afternoon, evening)
        if (day.activities && typeof day.activities === 'object' && !Array.isArray(day.activities)) {
            // Extract activities from the object structure with time slots
            const { morning, lunch, afternoon, evening } = day.activities;
            
            // Clean and format each activity
            if (morning) {
                const cleanMorning = removeAsterisks(morning.replace('Morning\n', '').trim());
                activitiesHTML += `<li><strong>Morning (08:00 - 12:00):</strong> ${cleanMorning}</li>`;
            }
            
            if (lunch) {
                const cleanLunch = removeAsterisks(lunch.replace('Lunch at', '').trim());
                activitiesHTML += `<li><strong>Lunch (12:00 - 14:00):</strong> ${cleanLunch}</li>`;
            }
            
            if (afternoon) {
                const cleanAfternoon = removeAsterisks(afternoon.replace('Afternoon\n', '').trim());
                activitiesHTML += `<li><strong>Afternoon (14:00 - 18:00):</strong> ${cleanAfternoon}</li>`;
            }
            
            if (evening) {
                const cleanEvening = removeAsterisks(evening.replace('Evening\n', '').trim());
                activitiesHTML += `<li><strong>Evening (18:00 - 22:00):</strong> ${cleanEvening}</li>`;
            }
        } 
        // Handle backwards compatibility with old array format
        else if (Array.isArray(day.activities)) {
            // Create time slots for array format based on number of activities
            const timeSlots = [
                'Morning (08:00 - 12:00)',
                'Lunch (12:00 - 14:00)',
                'Afternoon (14:00 - 18:00)',
                'Evening (18:00 - 22:00)'
            ];
            
            day.activities.forEach((activity, i) => {
                const timeSlot = i < timeSlots.length ? timeSlots[i] : `Activity ${i+1}`;
                const cleanActivity = removeAsterisks(activity);
                activitiesHTML += `<li><strong>${timeSlot}:</strong> ${cleanActivity}</li>`;
            });
        }
        
        dayContainer.innerHTML = `
            <h4 class="day-title">${cleanDayTitle}</h4>
            <ul class="day-activities">${activitiesHTML}</ul>
        `;
        
        previewDays.appendChild(dayContainer);
    });
    
    // Add download button functionality
    setupDownloadButton();
    
    // Add analytics event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_itinerary', {
            'destination': itinerary.destination,
            'num_days': itinerary.days.length
        });
    }
};

// Setup download button functionality
const setupDownloadButton = () => {
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (currentItinerary) {
                // Generate and download PDF using the exporter
                ItineraryPdfExport.exportToPdf(currentItinerary);
                
                // Add analytics event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'download_itinerary_pdf', {
                        'destination': currentItinerary.destination
                    });
                }
            } else {
                console.error('No itinerary data available for download');
                alert('Please generate an itinerary first before downloading.');
            }
        });
    }
};

// Reset the preview to default state
const resetPreview = () => {
    // Clear the current itinerary
    currentItinerary = null;
    
    const itineraryPreview = document.querySelector('.itinerary-preview');
    if (!itineraryPreview) return;
    
    itineraryPreview.classList.remove('generated');
    
    const previewHeader = itineraryPreview.querySelector('.preview-header');
    const previewDays = itineraryPreview.querySelector('.preview-days');
    
    previewHeader.innerHTML = `
        <h3>Your Cultural Journey</h3>
        <p>Enter destination and preferences to generate</p>
    `;
    
    previewDays.innerHTML = `
        <div class="placeholder-message">
            <i class="fas fa-map-marked-alt"></i>
            <p>Your personalized cultural itinerary will appear here after generation</p>
        </div>
    `;
};

// Set the preview to loading state
const setPreviewLoading = () => {
    // Clear the current itinerary
    currentItinerary = null;
    
    const itineraryPreview = document.querySelector('.itinerary-preview');
    if (!itineraryPreview) return;
    
    const previewHeader = itineraryPreview.querySelector('.preview-header');
    const previewDays = itineraryPreview.querySelector('.preview-days');
    
    previewHeader.innerHTML = `
        <h3>Generating Your Journey...</h3>
        <p>Our AI is crafting your personalized cultural experience</p>
    `;
    
    previewDays.innerHTML = `
        <div class="loading-message">
            <div class="loading-spinner"></div>
            <p>Creating a unique cultural itinerary powered by AI</p>
        </div>
    `;
};

// Initialize the itinerary generator
const initItineraryGenerator = () => {
    const generateButton = document.querySelector('.generate-btn');
    const itineraryPreview = document.querySelector('.itinerary-preview');
    const destinationInput = document.getElementById('destination');
    const durationSelect = document.getElementById('duration');
    
    if (generateButton && itineraryPreview && destinationInput) {
        // Reset to default view when form inputs change
        document.querySelectorAll('.itinerary-form input, .itinerary-form select').forEach(input => {
            input.addEventListener('change', resetPreview);
        });
        
        generateButton.addEventListener('click', async function() {
            if (!destinationInput.value.trim()) {
                alert('Please enter a destination to generate an itinerary.');
                return;
            }
            
            generateButton.textContent = 'Generating...';
            generateButton.disabled = true;
            
            // Show loading state
            setPreviewLoading();
            
            try {
                // Get interests from tags
                const interestTags = document.querySelectorAll('.interest-tag');
                const interests = Array.from(interestTags).map(tag => tag.textContent.replace(' ×', '').trim());
                
                // Get travel pace
                const pace = document.getElementById('pace').value;
                
                // Get duration from the select dropdown
                const duration = parseInt(durationSelect.value, 10) || 2;
                
                // Get itinerary from AI service
                const itinerary = await aiService.generateItinerary(
                    destinationInput.value.trim(),
                    interests,
                    duration,
                    pace
                );
                
                updateItineraryPreviewFromData(itinerary);
                
                // Scroll to show the itinerary
                itineraryPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (error) {
                alert('There was an error generating your itinerary. Please try again.');
                console.error('Error generating itinerary:', error);
                resetPreview();
            } finally {
                generateButton.textContent = 'Generate Itinerary';
                generateButton.disabled = false;
            }
        });
    }
};

// Main initialization function
const initItineraryBuilder = () => {
    initInterestsTagSystem();
    initItineraryGenerator();
    // Ensure preview is in default state on page load
    resetPreview();
};

export default initItineraryBuilder; 