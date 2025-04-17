// config.js - Configuration settings for YatraGPT
import { API_KEYS, setApiKey } from './apiKey.js';

// OpenRouter API Configuration
const config = {
    // Default API key (imported from apiKey.js)
    get OPENROUTER_API_KEY() {
        return API_KEYS.OPENROUTER_API_KEY;
    },
    
    // OpenRouter API settings
    AI_MODEL: "meta-llama/llama-3.2-3b-instruct:free", // Using Meta Llama 3.2 3B model
    ITINERARY_AI_MODEL: "qwen/qwen-2.5-72b-instruct:free",
    MAX_TOKENS: 1000,
    ITINERARY_MAX_TOKENS: 5000,
    TEMPERATURE: 0.7,
    
    // API endpoints
    OPENROUTER_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions',
    
    // Update API key using the function from apiKey.js
    setApiKey: setApiKey,
    
    // Get current model
    getCurrentModel: function() {
        return this.AI_MODEL;
    }
};

export default config; 