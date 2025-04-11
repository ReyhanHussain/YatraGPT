// profileModal.js - Handles profile creation and display
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase connection
const SUPABASE_URL = 'https://papiniammzgdbegejsyy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcGluaWFtbXpnZGJlZ2Vqc3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODE4NjIsImV4cCI6MjA1OTQ1Nzg2Mn0.scxsQCIrc8VNagvL0VWYUVqOfTKCDEAKzMwYCat6wNI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rating utilities
const calculateAverageRating = (rating, count) => {
    rating = Number(rating || 0);
    count = Number(count || 0);
    return count > 0 ? rating / count : 0;
};

const formatRating = (rating, count) => {
    return calculateAverageRating(rating, count).toFixed(1);
};

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

// Helper functions from cultureMatch
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

// Submit rating to database
const submitRating = async (profileId, profileElement, rating) => {
    try {
        // Validate rating
        const ratingValue = Number(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            showNotification('Invalid rating value');
            return false;
        }
        
        let newRating, newCount;
        
        // Try using the RPC function first
        try {
            const { error: rpcError } = await supabase.rpc('update_profile_rating', {
                p_id: profileId,
                p_rating: ratingValue
            });
            
            if (!rpcError) {
                // Get updated profile data
                const { data: updatedProfile } = await supabase
                    .from('cultural_connections')
                    .select('rating, rating_count')
                    .eq('id', profileId)
                    .single();
                    
                if (updatedProfile) {
                    newRating = updatedProfile.rating;
                    newCount = updatedProfile.rating_count;
                }
                
                showNotification('Rating submitted successfully!');
                return { success: true, rating: newRating, count: newCount };
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
            return { success: false };
        }
        
        // Calculate new values
        const currentRating = Number(currentProfile.rating || 0);
        const currentCount = Number(currentProfile.rating_count || 0);
        newRating = currentRating + ratingValue;
        newCount = currentCount + 1;
        
        // Update the database
        const { error: updateError } = await supabase
            .from('cultural_connections')
            .update({
                rating: newRating,
                rating_count: newCount
            })
            .eq('id', profileId);
            
        if (updateError) {
            showNotification('Rating could not be saved');
            return { success: false };
        }
        
        showNotification('Rating submitted successfully!');
        return { success: true, rating: newRating, count: newCount };
    } catch (error) {
        showNotification('An error occurred while submitting your rating');
        return { success: false };
    }
};

// Show notification
const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Show CAPTCHA verification
const showCaptchaVerification = (contactBtn, person) => {
    // Create CAPTCHA container
    const captchaContainer = document.createElement('div');
    captchaContainer.className = 'captcha-container';
    
    // Generate random code (4 digits)
    const captchaCode = Math.floor(1000 + Math.random() * 9000);
    
    captchaContainer.innerHTML = `
        <div class="captcha-header">
            <h4>Verify you're human</h4>
            <p class="captcha-note">Enter the code to view contact info</p>
        </div>
        <div class="captcha-code">${captchaCode}</div>
        <div class="captcha-input">
            <input type="text" id="captcha-input" placeholder="Enter code" maxlength="4">
            <button class="btn primary verify-btn">Verify</button>
        </div>
    `;
    
    const actionsDiv = contactBtn.parentElement;
    actionsDiv.innerHTML = '';
    actionsDiv.appendChild(captchaContainer);
    
    setTimeout(() => document.getElementById('captcha-input').focus(), 100);
    
    const verifyCaption = () => {
        const input = document.getElementById('captcha-input').value;
        if (input === captchaCode.toString()) {
            showContactInfo(actionsDiv, person.contact_info);
        } else {
            const codeDisplay = document.querySelector('.captcha-code');
            codeDisplay.innerHTML = 'Incorrect! Try again: ' + captchaCode;
            codeDisplay.style.color = 'red';
            document.getElementById('captcha-input').value = '';
        }
    };
    
    document.querySelector('.verify-btn').addEventListener('click', verifyCaption);
    document.getElementById('captcha-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') verifyCaption();
    });
};

// Show contact information
const showContactInfo = (container, contactInfo) => {
    const contactInfoDiv = document.createElement('div');
    contactInfoDiv.className = 'contact-info-container';
    
    const formattedInfo = formatContactInfoAsTable(contactInfo);
    
    contactInfoDiv.innerHTML = `
        <div class="contact-info-header">
            <h4>Contact Information</h4>
        </div>
        <div class="contact-info-body">
            ${formattedInfo}
        </div>
    `;
    
    container.innerHTML = '';
    container.appendChild(contactInfoDiv);
};

// Format contact info as a table
const formatContactInfoAsTable = (contactInfo) => {
    const items = contactInfo.split(/[,\n]+/).map(item => item.trim()).filter(item => item);
    
    if (items.length === 0) return contactInfo;
    
    let tableHtml = '<table class="contact-info-table">';
    
    items.forEach(item => {
        let type, value;
        
        if (item.includes('@') && !item.includes('Instagram') && !item.includes('Twitter')) {
            type = 'Email';
            value = item;
        } else if (item.toLowerCase().includes('whatsapp')) {
            type = 'WhatsApp';
            value = item.replace(/whatsapp[:]*\s*/i, '');
        } else if (item.toLowerCase().includes('instagram')) {
            type = 'Instagram';
            value = item.replace(/instagram[:]*\s*/i, '');
        } else if (item.toLowerCase().includes('twitter')) {
            type = 'Twitter';
            value = item.replace(/twitter[:]*\s*/i, '');
        } else if (item.match(/^\+?[\d\s\-()]{7,}$/)) {
            type = 'Phone';
            value = item;
        } else {
            [type, value] = item.includes(':') ? item.split(':', 2) : ['Other', item];
        }
        
        tableHtml += `
            <tr>
                <td class="contact-type">${type}</td>
                <td class="contact-value">${value}</td>
            </tr>
        `;
    });
    
    tableHtml += '</table>';
    return tableHtml;
};

// Show rating UI
const showRatingUI = (container, person, ratingHeaderElement) => {
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'profile-user-rating';
    
    ratingDiv.innerHTML = `
        <h3>Rate this ${person.type === 'local' ? 'Guide' : 'Traveler'}</h3>
        <p class="rating-notice">Your rating helps others find good matches</p>
        <div class="rating-stars">
            <i class="far fa-star" data-rating="1"></i>
            <i class="far fa-star" data-rating="2"></i>
            <i class="far fa-star" data-rating="3"></i>
            <i class="far fa-star" data-rating="4"></i>
            <i class="far fa-star" data-rating="5"></i>
        </div>
    `;
    
    container.appendChild(ratingDiv);
    
    // Add event listeners to stars
    const stars = ratingDiv.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        // Highlight stars on hover
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star';
                    s.style.color = '#FFD700';
                } else {
                    s.className = 'far fa-star';
                    s.style.color = '#C0C0C0';
                }
            });
        });
        
        // Handle click to submit rating
        star.addEventListener('click', async () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            const result = await submitRating(person.id, person, rating);
            
            if (result.success) {
                // Replace rating UI with thank you message
                ratingDiv.innerHTML = `
                    <div class="rating-thank-you">
                        <i class="fas fa-check-circle"></i> Thank you for your rating!
                    </div>
                `;
                
                // Update the rating display in the header
                if (result.rating !== undefined && result.count !== undefined && ratingHeaderElement) {
                    const newRatingHtml = generateUIComponent('rating', {
                        rating: result.rating, 
                        count: result.count
                    }, true);
                    
                    ratingHeaderElement.innerHTML = newRatingHtml;
                }
            }
        });
    });
    
    // Reset stars when mouse leaves
    ratingDiv.querySelector('.rating-stars').addEventListener('mouseleave', () => {
        stars.forEach(s => {
            s.className = 'far fa-star';
            s.style.color = '#C0C0C0';
        });
    });
};

// Show profile modal
const showProfile = (person) => {
    const modal = document.createElement('div');
    modal.className = 'modal profile-modal';
    
    const typeLabel = person.type === 'local' ? 'Local Guide' : 'Fellow Traveler';
    const interests = person.interests.map(i => `<div class="profile-interest">${i}</div>`).join('');
    const languages = person.languages.map(l => `<li>${l}</li>`).join('');
    
    // Generate UI components
    const availabilityHtml = generateUIComponent('availability', person.availability, true);
    const guideFeeHtml = generateUIComponent('guideFee', person, true);
    
    // Get rating data
    const rating = Number(person.rating || 0);
    const ratingCount = Number(person.rating_count || 0);
    const ratingHtml = generateUIComponent('rating', {rating, count: ratingCount}, true);
    
    modal.innerHTML = `
        <div class="modal-content profile-content">
            <button class="close-profile-btn"><i class="fas fa-times"></i></button>
            <div class="profile-header" style="background-image: url('${person.image}')">
                <div class="profile-header-overlay">
                    <div class="profile-type-badge">${typeLabel}</div>
                    <h2>${person.name}, ${person.age}</h2>
                    <div class="profile-country">
                        <i class="fas fa-globe"></i> ${person.country}
                    </div>
                </div>
            </div>
            <div class="profile-body">
                <div class="profile-info-header">
                    <div class="profile-rating-display">${ratingHtml}</div>
                    ${availabilityHtml}
                    ${guideFeeHtml}
                </div>
                <div class="profile-section">
                    <h3>About Me</h3>
                    <p>${person.bio}</p>
                </div>
                <div class="profile-columns">
                    <div class="profile-section">
                        <h3>My Interests</h3>
                        <div class="profile-interests">${interests}</div>
                    </div>
                    <div class="profile-section">
                        <h3>Languages</h3>
                        <ul class="profile-languages">${languages}</ul>
                    </div>
                </div>
                <div class="profile-rating-container"></div>
                <div class="profile-actions">
                    <button class="btn primary contact-btn">
                        <i class="fas fa-address-card"></i> View Contact Info
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-profile-btn').addEventListener('click', () => modal.remove());
    
    modal.querySelector('.contact-btn').addEventListener('click', () => {
        const contactBtn = modal.querySelector('.contact-btn');
        
        if (!person.contact_info) {
            contactBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> No contact info available';
            contactBtn.disabled = true;
            return;
        }
        
        showCaptchaVerification(contactBtn, person);
    });
    
    // Get the rating display element
    const ratingDisplayElement = modal.querySelector('.profile-rating-display');
    
    // Add rating UI
    showRatingUI(modal.querySelector('.profile-rating-container'), person, ratingDisplayElement);
    
    setTimeout(() => modal.classList.add('show'), 10);
};

export { showProfile }; 