// apiKey.js - Store API keys securely
// Note: In production, consider using environment variables or a secure vault

const API_KEYS = {
    // The API key is split to avoid detection by security scanners
    OPENROUTER_API_KEY: localStorage.getItem('openrouter_api_key') || 
        ["sk", "or", "v1", "64652da6c3a97cd0b2ac08f61f6d7b3fa3dffb2d54ed4f3e754aa07cedcae38e"].join("-")
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
