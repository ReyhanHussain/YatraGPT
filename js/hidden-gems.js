// Hidden Gems Modal Functionality
import { fetchAllGems, fetchFilteredGems, incrementGemViews, addGemToFavorites } from './hidden-gems-db.js';

export function initHiddenGems() {
    // Get the modal elements
    const showMoreBtn = document.querySelector('.show-more[data-modal="hidden-gems-modal"]');
    const gemsModal = document.getElementById('hidden-gems-modal');
    const closeBtn = gemsModal?.querySelector('.modal-close');
    
    // Open modal when Show More button is clicked
    showMoreBtn?.addEventListener('click', () => {
        gemsModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close modal when close button is clicked
    closeBtn?.addEventListener('click', closeModal);
    
    // Close modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === gemsModal) {
            closeModal();
        }
    });
    
    // Load initial gems
    loadInitialGems();
    
    // Initialize filters
    initFilters();
    
    // Initialize clickable gem cards
    initGemCards();
    
    function closeModal() {
        gemsModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// Load initial gems for the main section
async function loadInitialGems() {
    try {
        // Show loading spinner
        const gemsGrid = document.querySelector('.gems-grid');
        if (!gemsGrid) return;
        
        // Clear any existing content
        gemsGrid.innerHTML = '';
        
        // Add loading spinner
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div>';
        gemsGrid.appendChild(loadingSpinner);
        
        // Fetch data
        const gems = await fetchAllGems();
        
        // Remove loading spinner safely
        if (loadingSpinner.parentNode === gemsGrid) {
            gemsGrid.removeChild(loadingSpinner);
        }
        
        if (gems.length === 0) {
            // Show empty state
            gemsGrid.innerHTML = `
                <div class="gems-empty-state">
                    <i class="fas fa-map-marked-alt"></i>
                    <h3>No Hidden Gems Found</h3>
                    <p>We couldn't find any hidden gems in our database. Please check back later.</p>
                </div>
            `;
            return;
        }
        
        // Limit to 6 gems for the main section
        const mainGems = gems.slice(0, 6);
        
        // Add gems to the grid
        mainGems.forEach(gem => {
            const gemCard = createGemCard(gem);
            gemsGrid.appendChild(gemCard);
        });
        
        // Also populate the modal with all gems
        populateModalGems(gems);
        
    } catch (error) {
        console.error('Failed to load initial gems:', error);
        const gemsGrid = document.querySelector('.gems-grid');
        if (gemsGrid) {
            // Remove loading spinner if exists
            const loadingSpinner = gemsGrid.querySelector('.loading-spinner');
            if (loadingSpinner && loadingSpinner.parentNode === gemsGrid) {
                gemsGrid.removeChild(loadingSpinner);
            }
            
            // Show error state
            gemsGrid.innerHTML = `
                <div class="gems-empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Hidden Gems</h3>
                    <p>We encountered an error while loading data. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Populate the modal with all gems
function populateModalGems(gems) {
    const gemsList = document.querySelector('.gems-list');
    if (!gemsList) return;
    
    // Clear any existing content
    gemsList.innerHTML = '';
    
    // Add all gems to the list
    gems.forEach(gem => {
        const gemCard = createGemCard(gem);
        gemsList.appendChild(gemCard);
    });
}

// Create a gem card element
function createGemCard(gem) {
    console.log('Creating card for gem:', gem);
    
    const card = document.createElement('div');
    card.className = 'gem-card';
    card.setAttribute('data-id', gem.id);
    card.setAttribute('data-state', gem.state || '');
    card.setAttribute('data-region', gem.region || '');
    
    // Format difficulty and crowd level
    const difficultyClass = (gem.difficulty || 'moderate').toLowerCase();
    const crowdClass = (gem.crowd_level || 'low').toLowerCase().replace(' ', '-');
    
    // Use fallback images if needed
    const imageUrl = gem.image_url || 'https://source.unsplash.com/random/600x400/?india,landscape';
    
    card.innerHTML = `
        <div class="gem-favorite" title="Add to favorites">
            <i class="far fa-heart"></i>
        </div>
        <div class="gem-image" style="background-image: url('${imageUrl}')">
            <div class="gem-location">${gem.state_name || gem.state || ''}, ${gem.region || ''}</div>
        </div>
        <div class="gem-details">
            <h3 class="gem-name">${gem.name || 'Unknown Location'}</h3>
            <p class="gem-description">${gem.description || 'No description available.'}</p>
            <div class="gem-meta">
                <div class="gem-difficulty ${difficultyClass}"><i class="fas fa-mountain"></i> ${gem.difficulty || 'Moderate'}</div>
                <div class="gem-crowd ${crowdClass}"><i class="fas fa-users"></i> ${gem.crowd_level || 'Low'}</div>
            </div>
        </div>
    `;
    
    // Add favorite functionality
    const favoriteBtn = card.querySelector('.gem-favorite');
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card expansion
        
        // Toggle favorite state
        const isFavorited = favoriteBtn.classList.contains('active');
        
        if (isFavorited) {
            favoriteBtn.classList.remove('active');
            favoriteBtn.querySelector('i').className = 'far fa-heart';
            favoriteBtn.title = 'Add to favorites';
        } else {
            favoriteBtn.classList.add('active');
            favoriteBtn.querySelector('i').className = 'fas fa-heart';
            favoriteBtn.title = 'Remove from favorites';
            
            // Add to favorites in database
            addGemToFavorites(gem.id);
        }
    });
    
    return card;
}

function initGemCards() {
    const gemCards = document.querySelectorAll('.gem-card');
    const overlay = document.querySelector('.gem-overlay');
    
    // Make cards clickable
    gemCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't expand if close button was clicked
            if (e.target.closest('.close-button')) {
                e.stopPropagation();
                return;
            }
            
            // Expand the card
            expandCard(this);
            
            // Increment view count
            const gemId = parseInt(this.getAttribute('data-id'));
            if (gemId) {
                incrementGemViews(gemId);
            }
        });
    });
    
    // Close expanded card when clicking on overlay
    overlay.addEventListener('click', closeExpandedCard);
    
    // Close expanded card with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeExpandedCard();
    });
    
    function expandCard(card) {
        // If there's already an expanded card, close it first
        closeExpandedCard();
        
        // Add close button if not already there
        if (!card.querySelector('.close-button')) {
            const closeButton = document.createElement('div');
            closeButton.className = 'close-button';
            closeButton.innerHTML = '<i class="fas fa-times"></i>';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeExpandedCard();
            });
            card.appendChild(closeButton);
        }
        
        // Expand the card
        card.classList.add('expanded');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Add focus to the expanded card for accessibility
        card.setAttribute('tabindex', '-1');
        card.focus();
        
        // Add navigation arrows
        addCardNavigation(card);
    }
    
    function closeExpandedCard() {
        const expandedCard = document.querySelector('.gem-card.expanded');
        if (expandedCard) {
            expandedCard.classList.remove('expanded');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            
            // Remove navigation buttons
            const navButtons = document.querySelectorAll('.card-nav-button');
            navButtons.forEach(btn => btn.remove());
            
            // Remove keyboard navigation listener
            document.removeEventListener('keydown', handleCardKeyNavigation);
        }
    }
    
    function addCardNavigation(currentCard) {
        // Get all visible cards
        const visibleCards = Array.from(
            document.querySelectorAll('.gem-card:not([style*="display: none"])')
        );
        const currentIndex = visibleCards.indexOf(currentCard);
        
        // Create previous button if not the first card
        if (currentIndex > 0) {
            const prevButton = document.createElement('button');
            prevButton.className = 'card-nav-button prev-card';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevButton.setAttribute('aria-label', 'Previous hidden gem');
            prevButton.addEventListener('click', (e) => {
                e.stopPropagation();
                expandCard(visibleCards[currentIndex - 1]);
            });
            overlay.appendChild(prevButton);
        }
        
        // Create next button if not the last card
        if (currentIndex < visibleCards.length - 1) {
            const nextButton = document.createElement('button');
            nextButton.className = 'card-nav-button next-card';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextButton.setAttribute('aria-label', 'Next hidden gem');
            nextButton.addEventListener('click', (e) => {
                e.stopPropagation();
                expandCard(visibleCards[currentIndex + 1]);
            });
            overlay.appendChild(nextButton);
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleCardKeyNavigation);
    }
    
    function handleCardKeyNavigation(e) {
        if (!document.querySelector('.gem-card.expanded')) {
            document.removeEventListener('keydown', handleCardKeyNavigation);
            return;
        }
        
        const prevButton = document.querySelector('.card-nav-button.prev-card');
        const nextButton = document.querySelector('.card-nav-button.next-card');
        
        if (e.key === 'ArrowLeft' && prevButton) {
            e.preventDefault();
            prevButton.click();
        } else if (e.key === 'ArrowRight' && nextButton) {
            e.preventDefault();
            nextButton.click();
        }
    }
}

function initFilters() {
    const stateFilter = document.getElementById('state-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const crowdFilter = document.getElementById('crowd-filter');
    
    // Add event listeners to filters
    [stateFilter, difficultyFilter, crowdFilter].forEach(filter => {
        filter?.addEventListener('change', applyFilters);
    });
    
    // Initialize filters
    applyFilters();
}

async function applyFilters() {
    const stateFilter = document.getElementById('state-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const crowdFilter = document.getElementById('crowd-filter');
    
    const stateValue = stateFilter?.value || 'all';
    const difficultyValue = difficultyFilter?.value || 'all';
    const crowdValue = crowdFilter?.value || 'all';
    
    // Get the gems list container
    const gemsList = document.querySelector('.gems-list');
    if (!gemsList) return;
    
    try {
        // Show loading spinner
        // Clear any existing content
        gemsList.innerHTML = '';
        
        // Add loading spinner
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = '<div class="spinner"></div>';
        gemsList.appendChild(loadingSpinner);
        
        // Hide any existing no results message
        toggleNoResultsMessage(false);
        
        // Fetch filtered gems from Supabase
        const gems = await fetchFilteredGems({
            state: stateValue,
            difficulty: difficultyValue,
            crowd: crowdValue
        });
        
        // Remove loading spinner safely
        try {
            if (loadingSpinner.parentNode === gemsList) {
                gemsList.removeChild(loadingSpinner);
            }
        } catch (e) {
            console.warn('Loading spinner already removed:', e);
        }
        
        // Update the UI
        if (gems.length === 0) {
            gemsList.innerHTML = `
                <div class="gems-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Matches Found</h3>
                    <p>Try adjusting your filters to find more hidden gems.</p>
                </div>
            `;
        } else {
            // Clear the existing content
            gemsList.innerHTML = '';
            
            // Add the filtered gems
            gems.forEach(gem => {
                const gemCard = createGemCard(gem);
                gemsList.appendChild(gemCard);
            });
            
            // Reinitialize the cards to make them clickable
            initGemCards();
        }
    } catch (error) {
        console.error('Failed to apply filters:', error);
        
        // Remove loading spinner if it exists
        const loadingSpinner = gemsList.querySelector('.loading-spinner');
        if (loadingSpinner) {
            try {
                if (loadingSpinner.parentNode === gemsList) {
                    gemsList.removeChild(loadingSpinner);
                }
            } catch (e) {
                console.warn('Error removing spinner:', e);
            }
        }
        
        // Show error message
        gemsList.innerHTML = `
            <div class="gems-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Data</h3>
                <p>We encountered an error while filtering data. Please try again later.</p>
            </div>
        `;
    }
}

function toggleNoResultsMessage(show) {
    let noResultsMsg = document.querySelector('.no-results-message');
    
    if (!noResultsMsg && show) {
        noResultsMsg = createNoResultsMessage();
    }
    
    if (noResultsMsg) {
        noResultsMsg.style.display = show ? 'block' : 'none';
    }
}

function createNoResultsMessage() {
    const gemsList = document.querySelector('.gems-list');
    const noResultsMsg = document.createElement('div');
    noResultsMsg.className = 'no-results-message';
    noResultsMsg.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>No matches found</h3>
            <p>Try adjusting your filters to find more hidden gems.</p>
        </div>
    `;
    
    gemsList.parentNode.insertBefore(noResultsMsg, gemsList.nextSibling);
    return noResultsMsg;
} 