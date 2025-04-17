// config.js - Configuration settings for YatraGPT

// OpenRouter API Configuration
const config = {
    // Default API key (replace with your own in production)
    OPENROUTER_API_KEY: localStorage.getItem('openrouter_api_key') || "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",
    
    // OpenRouter API settings
    AI_MODEL: "meta-llama/llama-3.2-3b-instruct:free", // Using Meta Llama 3.2 3B model
    ITINERARY_AI_MODEL: "qwen/qwen-2.5-72b-instruct:free",
    MAX_TOKENS: 1000,
    ITINERARY_MAX_TOKENS: 5000,
    TEMPERATURE: 0.7,
    
    // API endpoints
    OPENROUTER_ENDPOINT: 'https://openrouter.ai/api/v1/chat/completions',
    
    // Update API key and save to localStorage
    setApiKey: function(apiKey) {
        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
            console.error("Invalid API key format");
            return false;
        }
        this.OPENROUTER_API_KEY = apiKey;
        localStorage.setItem('openrouter_api_key', apiKey);
        console.log("API key updated successfully");
        return true;
    },
    
    // Get current model
    getCurrentModel: function() {
        return this.AI_MODEL;
    }
};

export default config; 