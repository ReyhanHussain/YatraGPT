// chatbotAI.js - Handles AI model interactions for the chatbot
import config from './config.js';

/**
 * System prompt that defines the AI assistant's behavior and response style
 */
const SYSTEM_PROMPT = `You are YatraGPT's expert Cultural and Tourism AI Assistant powered by Meta Llama. Provide engaging, insightful information about cultural traditions, travel destinations, and historical sites worldwide.

FORMAT YOUR RESPONSES CAREFULLY:
- Use a warm, confident tone that's accessible and informative
- For section headings: Use bold with double asterisks (e.g., **Cultural Highlights**)
- For lists: Use bullet points with the • symbol (never use raw * asterisks)
- Keep formatting clean with minimal spacing between sections
- Ensure headings never repeat consecutively

CONTENT GUIDELINES:
- Highlight 3-5 specific examples with brief, compelling descriptions
- Emphasize unique cultural aspects, historical significance, and traveler experiences
- Provide practical information when relevant (best times to visit, local tips)
- Keep responses concise, focusing on quality over quantity
- Prioritize accuracy, cultural sensitivity, and memorable details

Make your responses both educational and enjoyable, inspiring users to explore global heritage.`;

/**
 * Gets a response from the AI model via OpenRouter API
 * @param {string} userMessage - The user's message to the AI
 * @param {Function} streamCallback - Optional callback for streaming text as it "arrives"
 * @returns {Promise<string>} - The AI's response
 */
export const getAIResponse = async (userMessage, streamCallback = null) => {
    // Validate input
    if (!userMessage || typeof userMessage !== 'string') {
        throw new Error('Invalid user message');
    }

    const messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": userMessage
        }
    ];
    
    try {
        console.log(`Calling OpenRouter API with Meta Llama 3.2 3B model: ${config.AI_MODEL}`);
        
        const response = await fetch(config.OPENROUTER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'YatraGPT Cultural Assistant'
            },
            body: JSON.stringify({
                model: config.AI_MODEL,
                messages: messages,
                max_tokens: config.MAX_TOKENS,
                temperature: config.TEMPERATURE,
                stream: false // Explicit setting for clarity
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Log the response for debugging (in development only)
        const isDev = typeof process !== 'undefined' && 
                     process.env && 
                     process.env.NODE_ENV === 'development';
        if (isDev) {
            console.log("OpenRouter API response:", data);
        }
        
        if (data.error) {
            console.error("API error details:", data.error);
            throw new Error(data.error.message || "API returned an error");
        }
        
        const fullResponse = extractResponseContent(data);
        
        // If streaming callback is provided, simulate typing effect
        if (streamCallback && typeof streamCallback === 'function') {
            await simulateTypingEffect(fullResponse, streamCallback);
        }
        
        return fullResponse;
        
    } catch (error) {
        console.error("API error:", error);
        throw new Error(`Failed to get AI response: ${error.message}`);
    }
};

/**
 * Calculates typing delay based on content for natural feel
 * @param {string} chunk - The text chunk
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(chunk) {
    const charCount = chunk.length;
    
    // Headings appear almost instantly
    if (chunk.includes('**')) {
        return Math.min(100, charCount * 1.5); 
    }
    
    // Bullet points get slightly faster
    if (chunk.match(/^[•\-*] /)) {
        return Math.min(80, charCount * 1);
    }
    
    // Short phrases are very fast
    if (charCount < 30) {
        return Math.min(60, charCount * 0.8);
    }
    
    // Even longer sentences are reasonably fast
    return Math.min(150, charCount * 1);
}

/**
 * Splits text into logical chunks for more natural typing simulation
 * @param {string} text - The text to split
 * @returns {Array<string>} - Array of text chunks
 */
function splitIntoChunks(text) {
    // Special case for short texts
    if (text.length < 300) {
        // For short responses, just use 2-3 chunks at most
        const chunks = [];
        const chunkSize = Math.max(50, Math.ceil(text.length / 3));
        
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, Math.min(i + chunkSize, text.length)));
        }
        
        return chunks;
    }

    // For longer texts, use semantic chunking
    // Identify key structural elements
    const headingMatches = [...text.matchAll(/\*\*(.*?)\*\*/g)];
    const bulletMatches = [...text.matchAll(/(\n[•\-*] .*?(?=\n|$))/g)];
    const paragraphMatches = [...text.matchAll(/(\n\n.*?)(?=\n\n|$)/g)];
    
    // Make paragraphs bigger chunks for faster display
    const allSpecialRegions = [
        ...headingMatches.map(m => ({ type: 'heading', index: m.index, length: m[0].length })),
        ...bulletMatches.map(m => ({ type: 'bullet', index: m.index, length: m[0].length })),
        ...paragraphMatches.map(m => ({ type: 'paragraph', index: m.index, length: m[0].length }))
    ].sort((a, b) => a.index - b.index);
    
    // If no special regions found, use fixed-size chunking
    if (allSpecialRegions.length === 0) {
        const chunks = [];
        const chunkSize = 120; // Larger chunks for faster display
        
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, Math.min(i + chunkSize, text.length)));
        }
        
        return chunks;
    }
    
    // Process the text maintaining special regions intact
    const chunks = [];
    let lastIndex = 0;
    
    for (const region of allSpecialRegions) {
        // Add text before this special region as one chunk
        if (region.index > lastIndex) {
            const textBefore = text.substring(lastIndex, region.index);
            // Only split long text sections
            if (textBefore.length > 150) {
                const midPoint = Math.floor(textBefore.length / 2);
                chunks.push(textBefore.substring(0, midPoint));
                chunks.push(textBefore.substring(midPoint));
            } else {
                chunks.push(textBefore);
            }
        }
        
        // Add the special region as a single chunk
        chunks.push(text.substring(region.index, region.index + region.length));
        lastIndex = region.index + region.length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        if (remainingText.length > 150) {
            const midPoint = Math.floor(remainingText.length / 2);
            chunks.push(remainingText.substring(0, midPoint));
            chunks.push(remainingText.substring(midPoint));
        } else {
            chunks.push(remainingText);
        }
    }
    
    return chunks;
}

/**
 * Simulates a typing effect by gradually revealing the text
 * @param {string} text - The full text to reveal gradually
 * @param {Function} updateCallback - Function to call with each text update
 * @returns {Promise<void>} - Resolves when typing simulation is complete
 */
async function simulateTypingEffect(text, updateCallback) {
    // Process the text for formatting
    const enhancedText = enhanceTextFormatting(text);
    
    // Split the text into logical chunks
    const chunks = splitIntoChunks(enhancedText);
    let displayedText = '';
    
    // For very short responses, just show them immediately
    if (text.length < 100) {
        updateCallback(enhancedText);
        return;
    }
    
    // Process each chunk with optimized speeds
    for (const chunk of chunks) {
        displayedText += chunk;
        updateCallback(displayedText);
        
        // Calculate and apply delay
        const delay = calculateDelay(chunk);
        await sleep(delay);
    }
}

/**
 * Enhances text formatting beyond the basic markdown
 * @param {string} text - The text to format
 * @returns {string} - Enhanced formatted text
 */
function enhanceTextFormatting(text) {
    if (!text) return '';
    
    // Replace multiple newlines with just one for tighter spacing
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Fix raw asterisks that should be bullet points (but not in headings with double asterisks)
    text = text.replace(/^(\s*)\*(?!\*)/gm, '$1• ');  // Convert standalone asterisks to bullets
    text = text.replace(/(\n\s*)\*(?!\*)/gm, '$1• ');  // Convert asterisks after newlines
    
    // Improve bullet point formatting
    text = text.replace(/^- /gm, '• ');  // Convert dashes to bullets
    text = text.replace(/^• /gm, '• ');  // Standardize bullets
    
    // Remove duplicate header titles that appear on consecutive lines
    text = text.replace(/^\*\*(.*?)\*\*[\s\n]*\*\*\1\*\*/gm, '**$1**');
    
    // Fix duplicate location/place names that appear on consecutive lines (• City, Country\nCity, Country)
    text = text.replace(/^• ([^•\n]+?)[\s\n]+\1\s*$/gm, '• $1');
    
    // Handle instances of "Text\nText" and "Text:\nText:" patterns
    const lines = text.split('\n');
    const uniqueLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i].trim();
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
        
        // Skip empty lines
        if (!currentLine) {
            uniqueLines.push('');
            continue;
        }
        
        // Check if next line is a duplicate (with or without colon)
        const currentBase = currentLine.replace(/:$/, '');
        const nextBase = nextLine.replace(/:$/, '');
        
        if (currentBase === nextBase) {
            // Add current line (prefer the one with colon if only one has it)
            if (!currentLine.endsWith(':') && nextLine.endsWith(':')) {
                uniqueLines.push(nextLine);
            } else {
                uniqueLines.push(currentLine);
            }
            i++; // Skip the next line since we've handled it
        } 
        // Check if location name is repeated (e.g. "• New Orleans, Louisiana, USA\nNew Orleans, Louisiana, USA")
        else if (currentLine.startsWith('• ') && 
                 currentLine.substring(2).trim() === nextLine.trim() &&
                 !nextLine.startsWith('• ')) {
            uniqueLines.push(currentLine);
            i++; // Skip the duplicate
        }
        else {
            uniqueLines.push(lines[i]);
        }
    }
    
    text = uniqueLines.join('\n');
    
    // Proper bullet formatting for text after colons
    text = text.replace(/^([^•\n]+):\n([^•\*\n])/gm, '$1:\n• $2');
    
    // Ensure minimal spacing after paragraphs
    text = text.replace(/([.!?])\s*\n\n([A-Z])/g, '$1\n$2');
    
    // Make sure there's spacing after headings
    text = text.replace(/\*\*(.*?)\*\*(?!\n)/g, '**$1**\n');
    
    // Keep spacing minimal after bullet points
    text = text.replace(/•\s*(.*?)(?:\n\n)/gm, '• $1\n');
    
    // Remove extra spaces that may appear
    text = text.replace(/\s{2,}/g, ' ');
    
    return text;
}

/**
 * Simple sleep function for delays
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts the content from different possible response formats
 * @param {Object} data - The API response data
 * @returns {string} - The extracted content
 */
function extractResponseContent(data) {
    if (!data) {
        return "I encountered an issue with the AI service. Please try again.";
    }
    
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        // The structure can vary depending on the model
        const choice = data.choices[0];
        
        // Look for the content in the expected location
        if (choice.message && choice.message.content) {
            return choice.message.content.trim();
        }
        
        // Some models might have different structure
        if (choice.content) {
            return choice.content.trim();
        }
        
        // Handle text field used by some models
        if (choice.text) {
            return choice.text.trim();
        }
        
        // Try to extract any content we can find
        if (typeof choice === 'object') {
            return Object.values(choice).find(v => typeof v === 'string') || 
                   "I received a response in an unexpected format.";
        }
    }
    
    // If we made it here, something unexpected happened with the response format
    console.error("Unexpected response format:", data);
    return "I encountered an issue with the AI service. Please try again or ask a different question.";
} 