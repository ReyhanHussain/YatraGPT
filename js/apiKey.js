// apiKey.js - Store API keys securely
// Note: In production, consider using environment variables or a secure vault

const API_KEYS = {
    OPENROUTER_API_KEY: localStorage.getItem('openrouter_api_key') || "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"
};

// Function to update API key and save to localStorage
const setApiKey = function(apiKey) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        console.error("Invalid API key format");
        return false;
    }
    API_KEYS.OPENROUTER_API_KEY = apiKey;
    localStorage.setItem('openrouter_api_key', apiKey);
    console.log("API key updated successfully");
    return true;
};

export { API_KEYS, setApiKey };
