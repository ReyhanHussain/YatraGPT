// cultureMatch.js - Handles cultural connection database and search functionality
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { showProfile } from './profileModal.js';

// Supabase connection details
const SUPABASE_URL = 'https://papiniammzgdbegejsyy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcGluaWFtbXpnZGJlZ2Vqc3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODE4NjIsImV4cCI6MjA1OTQ1Nzg2Mn0.scxsQCIrc8VNagvL0VWYUVqOfTKCDEAKzMwYCat6wNI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global state
let culturalConnections = [];
let currentFilters = {
    country: "all", interest: "all", type: "all", gender: "all", language: "all", searchText: "",
    availability: "all", rating: "all"
};
let currentPage = 1;
const itemsPerPage = 20;

// ===== UTILITY FUNCTIONS =====

// Format date to a readable string
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Rating utilities
const calculateAverageRating = (rating, count) => {
    rating = Number(rating || 0);
    count = Number(count || 0);
    return count > 0 ? rating / count : 0;
};

const formatRating = (rating, count) => {
    return calculateAverageRating(rating, count).toFixed(1);
};

// UI generation utilities
const generateStarsHtml = (averageRating) => {
    let html = '';
    const avgRating = Number(averageRating);
    
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(avgRating)) {
            html += '<i class="fas fa-star" style="color: #FFD700 !important;"></i>';
        } else if (i === Math.ceil(avgRating) && avgRating % 1 !== 0) {
            html += '<i class="fas fa-star-half-alt" style="color: #FFD700 !important;"></i>';
        } else {
            html += '<i class="far fa-star" style="color: #C0C0C0 !important;"></i>';
        }
    }
    
    return html;
};

// Consolidated UI component generator
const generateUIComponent = (type, data, isProfileModal = false) => {
    switch(type) {
        case 'availability':
            if (!data) return '';
            const availClassName = isProfileModal ? 'profile-availability' : 'connection-availability';
            return `<div class="${availClassName}">
                <i class="fas fa-clock" style="color: #4CAF50;"></i>
                <span>${isProfileModal ? 'Available: <strong>' : ''}${data}${isProfileModal ? '</strong>' : ''}</span>
            </div>`;
            
        case 'guideFee':
            if (data.type !== 'local' || !data.guide_fee) return '';
            const feeClassName = isProfileModal ? 'profile-fee' : 'connection-fee';
            return `<div class="${feeClassName}">
                <i class="fas fa-tag" style="color: #FF9800;"></i>
                <span>${isProfileModal ? 'Service: <strong>' : ''}${data.guide_fee}${isProfileModal ? '</strong>' : ''}</span>
            </div>`;
            
        case 'rating':
            const avgRating = calculateAverageRating(data.rating, data.count);
            const formattedRating = formatRating(data.rating, data.count);
            
            if (isProfileModal) {
                const starsHtml = generateStarsHtml(avgRating);
                return `<div class="profile-rating">
                    <span class="rating-value">${formattedRating}</span>
                    <div class="stars">${starsHtml}</div>
                    <span class="rating-count">(${data.count} ${data.count === 1 ? 'rating' : 'ratings'})</span>
                </div>`;
            } else {
                return `<div class="connection-rating">
                    <span>${formattedRating}</span>
                    <i class="fas fa-star" style="color: #FFD700 !important;"></i>
                    <span class="rating-count">(${data.count})</span>
                </div>`;
            }
    }
    return '';
};

// Notification utility
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// ===== DATA OPERATIONS =====

// Load connections from Supabase
const loadConnections = async () => {
    try {
        const { data, error } = await supabase.from('cultural_connections').select('*');
        
        if (error) {
            showNotification('Failed to load connections');
            culturalConnections = [];
            return;
        }
        
        culturalConnections = data && data.length > 0 ? data : [];
    } catch (error) {
        showNotification('Failed to load connections');
        culturalConnections = [];
    }
};

// Submit rating to database
const submitRating = async (profileId, rating) => {
    try {
        // Validate rating
        const ratingValue = Number(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            showNotification('Invalid rating value');
            return false;
        }
        
        // Try using the RPC function first
        try {
            const { error: rpcError } = await supabase.rpc('update_profile_rating', {
                p_id: profileId,
                p_rating: ratingValue
            });
            
            if (!rpcError) {
                await loadConnections();
                filterAndDisplayConnections();
                showNotification('Rating submitted successfully!');
                return true;
            }
        } catch (rpcError) {
            // Fallback to direct update if RPC fails
        }
        
        // Fallback to direct update method
        const { data: currentProfile, error: fetchError } = await supabase
            .from('cultural_connections')
            .select('rating, rating_count')
            .eq('id', profileId)
            .single();
            
        if (fetchError) {
            showNotification('Error retrieving current rating');
            return false;
        }
        
        // Calculate new values
        const currentRating = Number(currentProfile.rating || 0);
        const currentCount = Number(currentProfile.rating_count || 0);
        
        // Update the database
        const { error: updateError } = await supabase
            .from('cultural_connections')
            .update({
                rating: currentRating + ratingValue,
                rating_count: currentCount + 1
            })
            .eq('id', profileId);
            
        if (updateError) {
            showNotification('Rating could not be saved');
            return false;
        }
        
        // Reload data and update UI
        await loadConnections();
        filterAndDisplayConnections();
        showNotification('Rating submitted successfully!');
        return true;
    } catch (error) {
        showNotification('An error occurred while submitting your rating');
        return false;
    }
};

// ===== INITIALIZATION =====

// Initialize culture match section
const initCultureMatch = async () => {
    await loadConnections();
    
    // Set up the "Browse Cultural Connections" button
    const browseButton = document.querySelector('.match-explanation .btn.primary');
    if (browseButton) {
        browseButton.textContent = "Browse Cultural Connections";
        browseButton.addEventListener('click', showConnectionsInterface);
    }
    
    // Add contact info styles
    addContactInfoStyles();
};

// ===== CONNECTIONS INTERFACE =====

// Display the connections interface
const showConnectionsInterface = () => {
    let fullScreen = document.getElementById('connections-fullscreen');
    
    if (!fullScreen) {
        fullScreen = createConnectionsInterface();
        document.body.appendChild(fullScreen);
        setupEventListeners(fullScreen);
    } 
    
    fullScreen.classList.add('show');
    document.body.style.overflow = 'hidden';
    filterAndDisplayConnections();
};

// Create the connections interface
const createConnectionsInterface = () => {
    // Extract unique values for filter options
    const uniqueOptions = {
        countries: [...new Set(culturalConnections.map(p => p.country))].sort(),
        interests: [...new Set(culturalConnections.flatMap(p => p.interests))].sort(),
        languages: [...new Set(culturalConnections.flatMap(p => p.languages))].sort(),
        availability: [...new Set(culturalConnections.map(p => p.availability).filter(Boolean))].sort()
    };
    
    const fullScreen = document.createElement('div');
    fullScreen.id = 'connections-fullscreen';
    fullScreen.className = 'fullscreen-interface';
    
    fullScreen.innerHTML = `
        <div class="fullscreen-header">
            <div class="container">
                <div class="header-content" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2>Cultural Connections</h2>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button class="btn primary create-profile-btn"><i class="fas fa-plus"></i> Create Profile</button>
                        <button class="close-fullscreen-btn"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="fullscreen-filters">
            <div class="container">
                <div class="search-bar">
                    <input type="text" id="connection-search" placeholder="Search...">
                    <button id="search-btn"><i class="fas fa-search"></i></button>
                </div>
                <div class="filter-options">
                    <div class="filter-group">
                        <label for="country-filter">Country</label>
                        <select id="country-filter">
                            <option value="all">All Countries</option>
                            ${uniqueOptions.countries.map(country => `<option value="${country}">${country}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="interest-filter">Interest</label>
                        <select id="interest-filter">
                            <option value="all">All Interests</option>
                            ${uniqueOptions.interests.map(interest => `<option value="${interest}">${interest}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="language-filter">Language</label>
                        <select id="language-filter">
                            <option value="all">All Languages</option>
                            ${uniqueOptions.languages.map(language => `<option value="${language}">${language}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="type-filter">Type</label>
                        <select id="type-filter">
                            <option value="all">All Types</option>
                            <option value="local">Local Guides</option>
                            <option value="traveler">Fellow Travelers</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="gender-filter">Gender</label>
                        <select id="gender-filter">
                            <option value="all">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="availability-filter">Availability</label>
                        <select id="availability-filter">
                            <option value="all">Any Availability</option>
                            ${uniqueOptions.availability.map(option => `<option value="${option}">${option}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="rating-filter">Min Trust Rating</label>
                        <select id="rating-filter">
                            <option value="all">Any Rating</option>
                            <option value="1">1+ Stars</option>
                            <option value="2">2+ Stars</option>
                            <option value="3">3+ Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="fullscreen-content">
            <div class="container">
                <div class="connections-grid" id="connections-grid"></div>
            </div>
        </div>
    `;
    
    return fullScreen;
};

// Set up event listeners for the connections interface
const setupEventListeners = (container) => {
    // Close button
    container.querySelector('.close-fullscreen-btn').addEventListener('click', () => {
        container.classList.remove('show');
        document.body.style.overflow = '';
    });
    
    // Create Profile button
    container.querySelector('.create-profile-btn').addEventListener('click', showCreateProfileModal);
    
    // Search functionality
    const searchInput = container.querySelector('#connection-search');
    const searchBtn = container.querySelector('#search-btn');
    
    const handleSearch = () => {
        currentFilters.searchText = searchInput.value.trim().toLowerCase();
        filterAndDisplayConnections();
    };
    
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    
    // All filters
    ['country', 'interest', 'language', 'type', 'gender', 'availability', 'rating'].forEach(filter => {
        const filterElement = container.querySelector(`#${filter}-filter`);
        if (filterElement) {
            filterElement.addEventListener('change', (e) => {
                currentFilters[filter] = e.target.value;
                filterAndDisplayConnections();
            });
        }
    });
};

// Filter and display connections
const filterAndDisplayConnections = () => {
    const connectionsGrid = document.getElementById('connections-grid');
    if (!connectionsGrid) return;
    
    // Apply all filters at once
    const filtered = culturalConnections.filter(person => {
        // Basic filters
        if ((currentFilters.country !== 'all' && person.country !== currentFilters.country) ||
            (currentFilters.type !== 'all' && person.type !== currentFilters.type) ||
            (currentFilters.gender !== 'all' && person.gender !== currentFilters.gender) ||
            (currentFilters.availability !== 'all' && person.availability !== currentFilters.availability) ||
            (currentFilters.interest !== 'all' && !person.interests.includes(currentFilters.interest)) ||
            (currentFilters.language !== 'all' && !person.languages.includes(currentFilters.language)))
            return false;
        
        // Rating filter
        if (currentFilters.rating !== 'all') {
            const minRating = parseInt(currentFilters.rating);
            const avgRating = calculateAverageRating(person.rating, person.rating_count);
            if (avgRating < minRating) return false;
        }
        
        // Text search across multiple fields
        if (currentFilters.searchText) {
            const search = currentFilters.searchText.toLowerCase();
            const searchFields = [
                person.name.toLowerCase(),
                person.country.toLowerCase(),
                person.bio?.toLowerCase() || '',
                person.availability?.toLowerCase() || '',
                person.interests.join(' ').toLowerCase(),
                person.languages.join(' ').toLowerCase()
            ];
            
            return searchFields.some(field => field.includes(search));
        }
        
        return true;
    });
    
    // Sort results - prioritize profiles with ratings
    filtered.sort((a, b) => {
        const aHasRating = Number(a.rating_count || 0) > 0;
        const bHasRating = Number(b.rating_count || 0) > 0;
        
        // First by whether they have ratings
        if (aHasRating !== bHasRating) {
            return aHasRating ? -1 : 1; // Put profiles with ratings first
        }
        
        // Then by rating value
        return calculateAverageRating(b.rating, b.rating_count) - 
               calculateAverageRating(a.rating, a.rating_count);
    });
    
    // Reset to first page when filters change
    if (filtered.length > 0 && currentPage > Math.ceil(filtered.length / itemsPerPage)) {
        currentPage = 1;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
    const currentItems = filtered.slice(startIndex, endIndex);
    
    // Display results
    connectionsGrid.innerHTML = filtered.length === 0 ? 
        `<div class="no-results">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; color: #aaa;"></i>
            <h3>No matching connections found</h3>
            <p>Try adjusting your filters</p>
        </div>` : '';
    
    // Add each card to the grid
    currentItems.forEach(person => {
        connectionsGrid.appendChild(createPersonCard(person));
    });
    
    // Update pagination controls
    updatePaginationControls(filtered.length, totalPages);
};

// Create a person card
const createPersonCard = (person) => {
    const card = document.createElement('div');
    card.className = 'connection-card';
    card.setAttribute('data-id', person.id);
    
    const typeLabel = person.type === 'local' ? 'Local Guide' : 'Traveler';
    const interests = person.interests.slice(0, 3).map(i => 
        `<div class="connection-interest">${i}</div>`).join('');
    
    // Get rating data
    const rating = Number(person.rating || 0);
    const ratingCount = Number(person.rating_count || 0);
    
    // Generate HTML components
    const availabilityHtml = generateUIComponent('availability', person.availability);
    const guideFeeHtml = generateUIComponent('guideFee', person);
    const ratingHtml = generateUIComponent('rating', {rating, count: ratingCount});
    
    card.innerHTML = `
        <div class="connection-image" style="background-image: url('${person.image}')">
            <div class="connection-type">${typeLabel}</div>
        </div>
        <div class="connection-info">
            <div class="connection-name-age">${person.name}, ${person.age}</div>
            <div class="connection-country">
                <i class="fas fa-globe"></i> ${person.country}
            </div>
            <div class="connection-interests">${interests}</div>
            <div class="connection-languages">
                <span>Languages:</span> ${person.languages.join(', ')}
            </div>
            ${availabilityHtml}
            ${guideFeeHtml}
            ${ratingHtml}
        </div>
    `;
    
    card.addEventListener('click', () => showProfile(person));
    return card;
};

// ===== PROFILE DISPLAY =====

// Add contact information and CAPTCHA CSS
const addContactInfoStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Contact info styles */
        .contact-info-container, .captcha-container {
            margin-top: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .contact-info-header, .captcha-header {
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
        }
        
        .contact-info-header h4, .captcha-header h4 {
            margin: 0;
            color: var(--primary-color);
        }
        
        .contact-info-body {
            padding: 15px;
            font-size: 1.1rem;
            background-color: white;
            word-break: break-word;
        }
        
        /* Contact info table styles */
        .contact-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
        }
        
        .contact-info-table tr {
            border-bottom: 1px solid #eee;
        }
        
        .contact-info-table tr:last-child {
            border-bottom: none;
        }
        
        .contact-info-table td {
            padding: 8px 5px;
            vertical-align: middle;
        }
        
        .contact-info-table .contact-type {
            width: 80px;
            color: #666;
            font-weight: bold;
        }
        
        .contact-info-table .contact-value {
            color: #333;
        }
        
        /* CAPTCHA specific styles */
        .captcha-note {
            margin: 5px 0 0;
            font-size: 0.8rem;
            color: #666;
        }
        
        .captcha-code {
            padding: 15px;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            letter-spacing: 5px;
            background-color: #f0f0f0;
            font-family: monospace;
            user-select: none;
        }
        
        .captcha-input {
            padding: 15px;
            display: flex;
            gap: 10px;
        }
        
        .captcha-input input {
            flex: 1;
            padding: 8px 12px;
            font-size: 1.2rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
            letter-spacing: 5px;
        }
        
        /* Pagination styles */
        .pagination-controls {
            margin: 30px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        
        .pagination-info {
            color: #666;
            font-size: 0.9rem;
        }
        
        .pagination-buttons {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .pagination-pages {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .pagination-btn, .page-btn {
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .pagination-btn {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .pagination-btn:hover, .page-btn:hover {
            background-color: #f0f0f0;
        }
        
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .page-btn.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .pagination-ellipsis {
            color: #666;
            margin: 0 2px;
        }
    `;
    document.head.appendChild(styleElement);
};

// ===== PROFILE CREATION =====

// Show create profile modal
const showCreateProfileModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal profile-modal';
    
    // Get unique interests for the form
    const allInterests = [...new Set(culturalConnections.flatMap(p => p.interests))].sort();
    
    modal.innerHTML = `
        <div class="modal-content profile-content">
            <button class="close-profile-btn"><i class="fas fa-times"></i></button>
            <div class="profile-header create-profile-header" style="display: flex; align-items: center; justify-content: center; min-height: 150px; background-color: #f8f9fa;">
                <h1 style="color: var(--primary-color);">Create Your Profile</h1>
            </div>
            <div class="profile-body">
                <form id="create-profile-form" class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-name">Name *</label>
                            <input type="text" id="profile-name" required placeholder="Your name">
                        </div>
                        <div class="form-group">
                            <label for="profile-age">Age *</label>
                            <input type="number" id="profile-age" required min="18" max="100" placeholder="18+">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-gender">Gender *</label>
                            <select id="profile-gender" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="profile-type">Type *</label>
                            <select id="profile-type" required>
                                <option value="">Select Type</option>
                                <option value="local">Local Guide</option>
                                <option value="traveler">Traveler</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-country">Country *</label>
                            <select id="profile-country" required>
                                <option value="">Select Country</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="Italy">Italy</option>
                                <option value="Spain">Spain</option>
                                <option value="Japan">Japan</option>
                                <option value="China">China</option>
                                <option value="India">India</option>
                                <option value="Brazil">Brazil</option>
                                <option value="Mexico">Mexico</option>
                                <option value="South Africa">South Africa</option>
                                <option value="Egypt">Egypt</option>
                                <option value="Russia">Russia</option>
                                <option value="Turkey">Turkey</option>
                                <option value="Thailand">Thailand</option>
                                <option value="Singapore">Singapore</option>
                                <option value="New Zealand">New Zealand</option>
                                <option value="other">Other (specify)</option>
                            </select>
                        </div>
                        <div class="form-group" id="other-country-group" style="display: none;">
                            <label for="profile-other-country">Specify Country *</label>
                            <input type="text" id="profile-other-country" placeholder="Enter your country">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profile-bio">Bio * <span class="hint">(minimum 30 characters)</span></label>
                        <textarea id="profile-bio" rows="3" required minlength="30" placeholder="Tell us about yourself" style="width: 100%;"></textarea>
                        <div class="char-count" id="bio-char-count" style="text-align: right; font-size: 0.8rem;">0/30 min</div>
                    </div>
                    <div class="form-group">
                        <label for="profile-interests">Interests * <span class="hint">(Select exactly 5)</span></label>
                        <div class="interests-selection" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px;">
                            ${allInterests.map(interest => 
                                `<div class="interest-option" style="background: #f5f5f5; padding: 10px; border-radius: 4px; display: flex; align-items: center;">
                                    <input type="checkbox" id="interest-${interest}" value="${interest}" class="interest-checkbox" style="width: 20px; height: 20px; margin-right: 8px;">
                                    <label for="interest-${interest}" style="flex: 1;">${interest}</label>
                                </div>`
                            ).join('')}
                            <div class="interest-option" style="background: #f5f5f5; padding: 10px; border-radius: 4px; display: flex; align-items: center;">
                                <input type="checkbox" id="interest-other" value="other" class="interest-checkbox interest-other-checkbox" style="width: 20px; height: 20px; margin-right: 8px;">
                                <label for="interest-other" style="flex: 1;">Other</label>
                            </div>
                        </div>
                        <div id="other-interests-container" style="display: none; margin-top: 10px;">
                            <input type="text" id="other-interests" placeholder="Enter interests separated by commas">
                        </div>
                        <div id="interests-count" style="text-align: right; font-size: 0.8rem; margin-top: 5px;">0 of 5 selected</div>
                    </div>
                    <div class="form-group">
                        <label for="profile-languages">Languages * <span class="hint">(comma separated)</span></label>
                        <input type="text" id="profile-languages" required placeholder="e.g. English, Spanish, French">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile-availability">Availability *</label>
                            <select id="profile-availability" required>
                                <option value="">Select Availability</option>
                                <option value="Weekdays">Weekdays</option>
                                <option value="Weekends">Weekends</option>
                                <option value="Evenings">Evenings</option>
                                <option value="Mornings">Mornings</option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>
                        <div class="form-group" id="guide-fee-group" style="display: none;">
                            <label for="guide-fee">Guide Fee</label>
                            <select id="guide-fee">
                                <option value="Free">Free Service</option>
                                <option value="Paid">Paid Service</option>
                                <option value="Tips Only">Tips Appreciated</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profile-contact">Contact Information * <span class="hint">(hidden until requested)</span></label>
                        <textarea id="profile-contact" rows="2" required placeholder="Email, phone, social media handles, etc." style="width: 100%;"></textarea>
                        <div class="hint" style="font-size: 0.8rem;">This information will only be shown to users who request to connect with you</div>
                    </div>
                    <div class="form-group">
                        <label>Profile Image *</label>
                        <div class="image-upload-container" style="border: 2px dashed #ccc; padding: 20px; text-align: center; position: relative; margin-bottom: 10px; border-radius: 8px; background: #fafafa;">
                            <div class="image-preview" style="display: none; max-width: 150px; max-height: 150px; margin: 0 auto 10px auto; overflow: hidden; border-radius: 50%;">
                                <img id="profile-image-preview" style="width: 100%; height: auto;" src="">
                            </div>
                            <div class="upload-prompt">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #999; margin-bottom: 10px;"></i>
                                <p>Drag & drop your image here or</p>
                                <label for="profile-image-upload" class="btn secondary" style="display: inline-block; margin: 10px;">Browse Files</label>
                                <input type="file" id="profile-image-upload" accept="image/*" style="display: none;">
                            </div>
                        </div>
                        <input type="hidden" id="profile-image-data" name="profile-image-data">
                    </div>
                    <div class="form-actions" style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
                        <button type="submit" class="btn primary" style="min-width: 150px;">Create Profile</button>
                        <button type="button" class="btn secondary cancel-create" style="min-width: 150px;">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupProfileModalEventListeners(modal);
    setTimeout(() => modal.classList.add('show'), 10);
};

// Set up event listeners for the profile creation modal
const setupProfileModalEventListeners = (modal) => {
    // Close buttons
    modal.querySelector('.close-profile-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-create').addEventListener('click', () => modal.remove());
    
    // Country field
    const countrySelect = modal.querySelector('#profile-country');
    const otherCountryGroup = modal.querySelector('#other-country-group');
    countrySelect.addEventListener('change', () => {
        otherCountryGroup.style.display = countrySelect.value === 'other' ? 'block' : 'none';
    });
    
    // Type field - show fee options only for Local Guides
    const typeSelect = modal.querySelector('#profile-type');
    const feeGroup = modal.querySelector('#guide-fee-group');
    
    typeSelect.addEventListener('change', () => {
        feeGroup.style.display = typeSelect.value === 'local' ? 'block' : 'none';
        if (typeSelect.value !== 'local') {
            modal.querySelector('#guide-fee').value = 'Free';
        }
    });
    
    // Bio character count
    const bioField = modal.querySelector('#profile-bio');
    const bioCharCount = modal.querySelector('#bio-char-count');
    bioField.addEventListener('input', () => {
        const count = bioField.value.length;
        bioCharCount.textContent = `${count}/30 min`;
        bioCharCount.style.color = count >= 30 ? 'green' : 'red';
    });
    
    // Interests selection
    setupInterestsSelection(modal);
    
    // Image upload
    setupImageUpload(modal);
    
    // Form submission
    setupFormSubmission(modal);
};

// Setup interests selection functionality
const setupInterestsSelection = (modal) => {
    const interestCheckboxes = modal.querySelectorAll('.interest-checkbox');
    const interestsCount = modal.querySelector('#interests-count');
    const otherInterestsContainer = modal.querySelector('#other-interests-container');
    const otherCheckbox = modal.querySelector('.interest-other-checkbox');
    
    otherCheckbox.addEventListener('change', () => {
        otherInterestsContainer.style.display = otherCheckbox.checked ? 'block' : 'none';
    });
    
    const updateInterestsCount = () => {
        const count = modal.querySelectorAll('.interest-checkbox:checked').length;
        interestsCount.textContent = `${count} of 5 selected`;
        interestsCount.style.color = count === 5 ? 'green' : 'red';
    };
    
    interestCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (modal.querySelectorAll('.interest-checkbox:checked').length > 5) {
                checkbox.checked = false;
                alert('You must select exactly 5 interests');
            }
            updateInterestsCount();
        });
    });
    
    updateInterestsCount();
};

// Set up image upload functionality
const setupImageUpload = (modal) => {
    const imageUploadContainer = modal.querySelector('.image-upload-container');
    const imageInput = modal.querySelector('#profile-image-upload');
    const imagePreview = modal.querySelector('.image-preview');
    const imagePreviewElement = modal.querySelector('#profile-image-preview');
    const imageDataInput = modal.querySelector('#profile-image-data');
    
    // Function to handle image file
    const handleImageFile = (file) => {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreviewElement.src = e.target.result;
            imageDataInput.value = e.target.result;
            imagePreview.style.display = 'block';
            imageUploadContainer.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    };
    
    // File input change
    imageInput.addEventListener('change', () => {
        if (imageInput.files && imageInput.files[0]) {
            handleImageFile(imageInput.files[0]);
        }
    });
    
    // Drag and drop functionality
    imageUploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadContainer.style.borderColor = '#2196F3';
        imageUploadContainer.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
    });
    
    imageUploadContainer.addEventListener('dragleave', () => {
        imageUploadContainer.style.borderColor = '#ccc';
        imageUploadContainer.style.backgroundColor = '';
    });
    
    imageUploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadContainer.style.borderColor = '#ccc';
        imageUploadContainer.style.backgroundColor = '';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
};

// Setup form submission
const setupFormSubmission = (modal) => {
    modal.querySelector('#create-profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validations
        if (!validateProfileForm(modal)) {
            return;
        }
        
        handleProfileFormSubmit(e, modal);
    });
};

// Validate profile form
const validateProfileForm = (modal) => {
    const validationChecks = [
        // Check interests
        {
            condition: modal.querySelectorAll('.interest-checkbox:checked').length !== 5,
            message: 'Please select exactly 5 interests'
        },
        // Check other interests
        {
            condition: modal.querySelector('.interest-other-checkbox').checked && 
                      !modal.querySelector('#other-interests').value.trim(),
            message: 'Please specify your other interests'
        },
        // Check bio length
        {
            condition: modal.querySelector('#profile-bio').value.trim().length < 30,
            message: 'Please provide a bio with at least 30 characters'
        },
        // Check country
        {
            condition: modal.querySelector('#profile-country').value === 'other' && 
                      !modal.querySelector('#profile-other-country').value.trim(),
            message: 'Please specify your country'
        },
        // Check languages
        {
            condition: !modal.querySelector('#profile-languages').value.trim(),
            message: 'Please provide at least one language'
        }
    ];
    
    for (const check of validationChecks) {
        if (check.condition) {
            alert(check.message);
            return false;
        }
    }
    
    return true;
};

// Handle profile form submission
const handleProfileFormSubmit = async (e, modal) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = modal.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitBtn.disabled = true;
    
    // Validate image
    const imageDataInput = modal.querySelector('#profile-image-data');
    if (!imageDataInput.value) {
        alert('Please upload a profile image or use a placeholder');
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        return;
    }
    
    // Get form values and create profile object
    const newProfile = getProfileDataFromForm(modal);
    
    try {
        // Insert the new profile into Supabase
        const { data, error } = await supabase
            .from('cultural_connections')
            .insert([newProfile])
            .select();
            
        if (error) throw error;
        
        // Add to local connections array
        if (data && data.length > 0) {
            culturalConnections.push(data[0]);
            showNotification('Profile created successfully!');
        } else {
            const tempId = Date.now();
            culturalConnections.push({...newProfile, id: tempId});
            showNotification('Profile created (database sync incomplete)');
        }
        
        // Close modal and refresh display
        modal.remove();
        filterAndDisplayConnections();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert(`Error creating profile: ${error.message || 'Unknown error'}`);
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
};

// Get profile data from form
const getProfileDataFromForm = (modal) => {
    const name = modal.querySelector('#profile-name').value;
    const age = parseInt(modal.querySelector('#profile-age').value);
    const gender = modal.querySelector('#profile-gender').value;
    const type = modal.querySelector('#profile-type').value;
    
    let country = modal.querySelector('#profile-country').value;
    if (country === 'other') {
        country = modal.querySelector('#profile-other-country').value;
    }
    
    const bio = modal.querySelector('#profile-bio').value;
    const availability = modal.querySelector('#profile-availability').value;
    const image = modal.querySelector('#profile-image-data').value;
    const contactInfo = modal.querySelector('#profile-contact').value.trim();
    
    // Get selected interests
    const selectedInterests = getSelectedInterests(modal);
    
    // Get languages
    const languages = modal.querySelector('#profile-languages').value
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang);
    
    // Create base profile object
    const profile = {
        name,
        age,
        gender,
        country,
        bio,
        interests: selectedInterests,
        languages,
        type,
        image,
        availability,
        rating: 0,
        rating_count: 0,
        contact_info: contactInfo
    };
    
    // Add guide_fee ONLY for local guides
    if (type === 'local') {
        profile.guide_fee = modal.querySelector('#guide-fee').value || 'Free';
    }
    
    return profile;
};

// Get selected interests from form
const getSelectedInterests = (modal) => {
    const selectedInterests = [];
    const otherCheckbox = modal.querySelector('.interest-other-checkbox');
    
    modal.querySelectorAll('.interest-checkbox:checked').forEach(checkbox => {
        if (checkbox.value === 'other') {
            // Split other interests by commas and add them
            const otherInterests = modal.querySelector('#other-interests').value
                .split(',')
                .map(interest => interest.trim())
                .filter(interest => interest);
                
            // Take only what we need to reach 5 total interests
            const remainingSlots = 5 - selectedInterests.length;
            selectedInterests.push(...otherInterests.slice(0, remainingSlots));
        } else {
            selectedInterests.push(checkbox.value);
        }
    });
    
    return selectedInterests;
};

// Update pagination controls
const updatePaginationControls = (totalItems, totalPages) => {
    let paginationContainer = document.getElementById('pagination-controls');
    
    // Create pagination container if it doesn't exist
    if (!paginationContainer) {
        const fullscreenContent = document.querySelector('.fullscreen-content .container');
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-controls';
        paginationContainer.className = 'pagination-controls';
        fullscreenContent.appendChild(paginationContainer);
    }
    
    // Clear previous pagination
    paginationContainer.innerHTML = '';
    
    // Don't show pagination if only one page
    if (totalPages <= 1) return;
    
    // Create pagination elements
    paginationContainer.innerHTML = `
        <div class="pagination-info">
            Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}
        </div>
        <div class="pagination-buttons">
            <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <div class="pagination-pages">
                ${generatePaginationNumbers(totalPages)}
            </div>
            <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const prevBtn = paginationContainer.querySelector('.prev-btn');
    const nextBtn = paginationContainer.querySelector('.next-btn');
    const pageButtons = paginationContainer.querySelectorAll('.page-btn');
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterAndDisplayConnections();
            window.scrollTo(0, document.querySelector('.fullscreen-filters').offsetTop);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            filterAndDisplayConnections();
            window.scrollTo(0, document.querySelector('.fullscreen-filters').offsetTop);
        }
    });
    
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            filterAndDisplayConnections();
            window.scrollTo(0, document.querySelector('.fullscreen-filters').offsetTop);
        });
    });
};

// Generate pagination numbers
const generatePaginationNumbers = (totalPages) => {
    let html = '';
    
    // Logic to show current page, and some pages before and after
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if at the end
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // First page
    if (startPage > 1) {
        html += `<button class="page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    return html;
};

export default initCultureMatch;

