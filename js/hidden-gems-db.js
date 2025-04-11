import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase connection details
const SUPABASE_URL = 'https://papiniammzgdbegejsyy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcGluaWFtbXpnZGJlZ2Vqc3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODE4NjIsImV4cCI6MjA1OTQ1Nzg2Mn0.scxsQCIrc8VNagvL0VWYUVqOfTKCDEAKzMwYCat6wNI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches all hidden gems from Supabase
 * @returns {Promise<Array>} Array of hidden gem objects
 */
export async function fetchAllGems() {
    try {
        console.log('Fetching all gems...');
        const { data, error } = await supabase
            .from('hidden_gems')
            .select('*')
            .order('id', { ascending: true });
            
        if (error) {
            console.error('Error fetching gems:', error);
            return [];
        }
        
        console.log('Gems fetched:', data ? data.length : 0, 'results');
        return data || [];
    } catch (err) {
        console.error('Failed to fetch gems:', err);
        return [];
    }
}

/**
 * Fetches hidden gems filtered by state, difficulty, and crowd level
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of filtered hidden gem objects
 */
export async function fetchFilteredGems(filters = {}) {
    const { state, difficulty, crowd } = filters;
    
    console.log('Filtering gems with:', { state, difficulty, crowd });
    
    try {
        let query = supabase
            .from('hidden_gems')
            .select('*');
        
        // Apply filters if provided
        if (state && state !== 'all') {
            query = query.eq('state', state);
        }
        
        if (difficulty && difficulty !== 'all') {
            query = query.eq('difficulty', difficulty);
        }
        
        if (crowd && crowd !== 'all') {
            query = query.eq('crowd_level', crowd);
        }
        
        // Execute the query
        const { data, error } = await query.order('id', { ascending: true });
        
        if (error) {
            console.error('Error fetching filtered gems:', error);
            return [];
        }
        
        console.log('Filtered gems:', data ? data.length : 0, 'results');
        return data || [];
    } catch (err) {
        console.error('Failed to fetch filtered gems:', err);
        return [];
    }
}

/**
 * Increments the view count for a specific gem
 * @param {number} gemId - The ID of the gem
 */
export async function incrementGemViews(gemId) {
    try {
        const { error } = await supabase.rpc('increment_gem_views', { gem_id: gemId });
        
        if (error) {
            console.error('Error incrementing gem views:', error);
        }
    } catch (err) {
        console.error('Failed to increment gem views:', err);
    }
}

/**
 * Adds a favorite for a gem (assuming user functionality)
 * @param {number} gemId - The ID of the gem to favorite
 * @param {string} userId - The user ID (optional)
 */
export async function addGemToFavorites(gemId, userId = 'anonymous') {
    try {
        const { error } = await supabase
            .from('gem_favorites')
            .insert({ gem_id: gemId, user_id: userId });
            
        if (error) {
            console.error('Error adding gem to favorites:', error);
        }
    } catch (err) {
        console.error('Failed to add gem to favorites:', err);
    }
}

// Test Supabase connection
(async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('hidden_gems').select('count', { count: 'exact' });
        
        if (error) {
            console.error('Connection error:', error);
        } else {
            console.log('Connection successful! Table exists.');
        }
    } catch (err) {
        console.error('Failed to connect to Supabase:', err);
    }
})(); 