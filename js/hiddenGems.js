// Hidden Gems of India functionality
import { initHiddenGemsModal } from './hiddenGemsModal.js';

export default function initHiddenGems() {
    const hiddenGemsSection = document.getElementById('hidden-gems');
    if (!hiddenGemsSection) return;

    // Setup region filter for main page
    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) {
        regionFilter.addEventListener('change', function() {
            filterPlacesByRegion(this.value);
        });
    }

    // Initialize the modal
    initHiddenGemsModal();
}

// Filter places by region on the main page
function filterPlacesByRegion(state) {
    const allCards = document.querySelectorAll('.hidden-gems-grid .place-card');
    
    if (state === 'all') {
        // Show all cards
        allCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Filter cards based on state
    allCards.forEach(card => {
        const locationElement = card.querySelector('.place-location');
        const locationText = locationElement.textContent;
        
        if (locationText.includes(state)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
} 