// main.js - Main entry point that initializes all modules

// Import all modules
import initNavigation from './navigation.js';
import { initChatbot } from './chatbot.js';
import initItineraryBuilder from './itineraryBuilder.js';
import initEcoCalculator from './ecoCalculator.js';
import initCultureMatch from './cultureMatch.js';
import initScrollAnimations from './animations.js';
import initModals from './modal.js';
import { initTranslations } from './translation.js';

// Initialize all application features when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core functionality
    initNavigation();
    initScrollAnimations();
    initModals();
    
    // Initialize language selector
    initTranslations();
    
    // Initialize feature-specific modules
    initChatbot();
    initItineraryBuilder();
    initEcoCalculator();
    initCultureMatch();
    
    console.log('YatraGPT application initialized successfully');
}); 