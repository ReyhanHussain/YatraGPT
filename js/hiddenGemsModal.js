// hiddenGemsModal.js - Dedicated modal functionality for Hidden Gems feature

// Initialize the Hidden Gems modal
export function initHiddenGemsModal() {
    // Get the modal element
    const modal = document.getElementById('hidden-gems-profiles');
    if (!modal) {
        console.error('Hidden Gems modal not found');
        return;
    }

    // Get the show more button
    const showMoreBtn = document.querySelector('.show-more-btn');
    if (showMoreBtn) {
        // Add click event to show modal
        showMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Opening Hidden Gems modal');
            modal.style.display = 'block';
        });
    }

    // Get the close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        // Add click event to close modal
        closeBtn.addEventListener('click', function() {
            console.log('Closing Hidden Gems modal');
            modal.style.display = 'none';
        });
    }

    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('Closing Hidden Gems modal (clicked outside)');
            modal.style.display = 'none';
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            console.log('Closing Hidden Gems modal (escape key)');
            modal.style.display = 'none';
        }
    });

    // Initialize tabs and filters
    initModalTabs();
    initModalFilters();
}

// Initialize the tabs in the modal
function initModalTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter gems based on tab region
            const tabType = this.getAttribute('data-tab');
            filterByTab(tabType);
        });
    });
}

// Initialize filters in the modal
function initModalFilters() {
    // Search filter
    const searchInput = document.getElementById('gems-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            filterBySearch(searchText);
        });
    }

    // Difficulty filter
    const difficultyFilter = document.getElementById('gems-difficulty');
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', function() {
            filterByDifficulty(this.value);
        });
    }

    // Crowd level filter
    const crowdFilter = document.getElementById('gems-crowd');
    if (crowdFilter) {
        crowdFilter.addEventListener('change', function() {
            filterByCrowd(this.value);
        });
    }

    // Pagination
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    if (paginationButtons.length) {
        paginationButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                paginationButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Implement pagination (simplified version)
                console.log('Pagination clicked:', this.textContent.trim());
            });
        });
    }
}

// Filter gems by tab/region
function filterByTab(tabType) {
    const gemCards = document.querySelectorAll('.gem-card');
    
    if (tabType === 'all-gems') {
        gemCards.forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }

    // Map tab types to regions
    const tabToRegionMap = {
        'north-india': 'North',
        'south-india': 'South',
        'east-india': 'East',
        'northeast-india': 'Northeast',
        'west-india': 'West'
    };

    const region = tabToRegionMap[tabType];
    
    gemCards.forEach(card => {
        if (card.getAttribute('data-region') === region) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter gems by search text
function filterBySearch(searchText) {
    const gemCards = document.querySelectorAll('.gem-card');
    
    gemCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const location = card.querySelector('.gem-location').textContent.toLowerCase();
        
        if (name.includes(searchText) || location.includes(searchText)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter gems by difficulty
function filterByDifficulty(difficulty) {
    const gemCards = document.querySelectorAll('.gem-card');
    
    if (difficulty === 'all') {
        gemCards.forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }
    
    gemCards.forEach(card => {
        if (card.getAttribute('data-difficulty') === difficulty) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter gems by crowd level
function filterByCrowd(crowdLevel) {
    const gemCards = document.querySelectorAll('.gem-card');
    
    if (crowdLevel === 'all') {
        gemCards.forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }
    
    gemCards.forEach(card => {
        if (card.getAttribute('data-crowd') === crowdLevel) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
} 