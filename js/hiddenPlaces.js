import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase connection details
const SUPABASE_URL = 'https://papiniammzgdbegejsyy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcGluaWFtbXpnZGJlZ2Vqc3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODE4NjIsImV4cCI6MjA1OTQ1Nzg2Mn0.scxsQCIrc8VNagvL0VW';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function initHiddenPlaces() {
    const placesContainer = document.querySelector('.hidden-places-container');
    
    if (!placesContainer) return;
    
    // Load initial places
    loadHiddenPlaces();
    
    // Set up region filter if it exists
    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) {
        regionFilter.addEventListener('change', () => {
            loadHiddenPlaces(regionFilter.value);
        });
    }
}

async function loadHiddenPlaces(region = 'all') {
    const placesContainer = document.querySelector('.hidden-places-grid');
    
    if (!placesContainer) return;
    
    // Show loading state
    placesContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading hidden gems...</div>';
    
    try {
        // Query Supabase for hidden places
        let query = supabase.from('hidden_places_india').select('*');
        
        // Apply region filter if specified
        if (region !== 'all') {
            query = query.eq('region', region);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Clear container and display places
        placesContainer.innerHTML = '';
        
        if (data.length === 0) {
            placesContainer.innerHTML = '<p class="no-results">No hidden places found for this region. Try another filter.</p>';
            return;
        }
        
        // Render each place
        data.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            
            placeCard.innerHTML = `
                <div class="place-image" style="background-image: url('${place.image_url || 'https://source.unsplash.com/random/400x300/?india,nature'}')"></div>
                <div class="place-info">
                    <h3>${place.name}</h3>
                    <p class="place-location"><i class="fas fa-map-marker-alt"></i> ${place.location}, ${place.region}</p>
                    <p class="place-description">${place.description.substring(0, 100)}${place.description.length > 100 ? '...' : ''}</p>
                    <div class="place-meta">
                        <span><i class="fas fa-hiking"></i> ${place.difficulty || 'Easy'}</span>
                        <span><i class="fas fa-users"></i> ${place.crowd_level || 'Low'}</span>
                    </div>
                </div>
            `;
            
            placesContainer.appendChild(placeCard);
        });
        
    } catch (error) {
        console.error('Error loading hidden places:', error);
        placesContainer.innerHTML = `<p class="error-message">Failed to load hidden places. Please try again later.</p>`;
    }
} 