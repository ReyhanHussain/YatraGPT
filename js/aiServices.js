// aiServices.js - Simplified AI-powered generation services
import config from './config.js';

const aiService = {
    // Generate travel itinerary
    generateItinerary: async (destination, interests, days, pace) => {
        try {
            // Create a simplified prompt
            const prompt = createItineraryPrompt(destination, interests, days, pace);
            
            // Make API call
            const response = await callAI(
                config.ITINERARY_AI_MODEL, 
                "You are a cultural travel itinerary expert that creates detailed day-by-day plans focusing on authentic local experiences.",
                prompt,
                config.ITINERARY_MAX_TOKENS
            );
            
            // Parse the response
            return parseItineraryResponse(response, destination, days);
            
        } catch (error) {
            console.error("Error generating itinerary:", error);
            throw new Error(`Failed to generate itinerary: ${error.message}`);
        }
    },
    
    // Generate travel recommendations
    getRecommendations: async (preferences) => {
        try {
            // Create a simplified prompt
            const prompt = createRecommendationsPrompt(preferences);
            
            // Make API call
            const response = await callAI(
                config.RECOMMENDATIONS_AI_MODEL || config.ITINERARY_AI_MODEL,
                "You are a cultural travel expert specializing in personalized recommendations.",
                prompt,
                config.ITINERARY_MAX_TOKENS
            );
            
            // Parse the response
            return parseRecommendationsResponse(response);
            
        } catch (error) {
            console.error("Error generating recommendations:", error);
            throw new Error(`Failed to generate recommendations: ${error.message}`);
        }
    }
};

// Shared API call function to reduce redundancy
async function callAI(model, systemPrompt, userPrompt, maxTokens) {
    console.log(`Calling OpenRouter API with model: ${model}`);
    
    const response = await fetch(config.OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'YatraGPT'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    "role": "system",
                    "content": systemPrompt
                },
                {
                    "role": "user",
                    "content": userPrompt
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });
    
    const data = await response.json();
    
    if (data.error) {
        console.error("API error details:", data.error);
        throw new Error(data.error.message || "API returned an error");
    }
    
    return data;
}

// Create a simplified prompt for itinerary generation
const createItineraryPrompt = (destination, interests, days, pace) => {
    const paceLevel = pace ? ['very relaxed', 'relaxed', 'moderate', 'active', 'very active'][pace - 1] : 'moderate';
    const interestsText = interests && interests.length > 0 
        ? `focused on ${interests.join(", ")}` 
        : "covering diverse cultural experiences";
    
    return `Create a ${days}-day cultural itinerary for ${destination} ${interestsText} at a ${paceLevel} pace.

Format the itinerary as follows:
1. Start with "Cultural Journey to ${destination}" as title
2. Include a brief introduction paragraph about the cultural highlights
3. For each day, include:
   - Day heading with a thematic title
   - Morning activity with specific venue name and description
   - Lunch recommendation with restaurant name
   - Afternoon activity with specific venue name and description
   - Evening activity with specific venue name and description
4. End with these distinct sections:

ESSENTIAL TRAVEL INFORMATION:
- LANGUAGE BASICS: 3-5 useful phrases with translations
- GETTING AROUND: Local transport methods and costs
- CULTURAL KNOW-HOW: Important customs and etiquette
- FOOD GUIDE: Must-try local dishes and where to find them
- VISITOR TIPS: Best times to visit attractions

PRACTICAL MATTERS:
- SEASONAL ADVICE: Weather patterns and ideal months to visit
- SAFETY & HEALTH: Local emergency numbers and safety tips
- MONEY MATTERS: Currency information and payment methods
- PACKING LIST: Essential items specific to this destination
- BUDGET PLANNING: Approximate costs for activities and meals

INSIDER KNOWLEDGE:
- HIDDEN GEMS: Lesser-known spots loved by locals
- LOCAL FESTIVALS: Notable cultural events throughout the year
- SHOPPING GUIDE: Best places for authentic souvenirs

Use **bold** formatting for all venue names, attraction names, and restaurant names.`;
};

// Parse itinerary response
const parseItineraryResponse = (data, destination, requestedDays) => {
    // Extract the text content from the API response
    if (!data.choices || !data.choices[0]) {
        throw new Error("Invalid API response format");
    }
    
    const choice = data.choices[0];
    const content = choice.message?.content || choice.content || choice.text || "";
    
    if (!content) {
        throw new Error("No content found in API response");
    }
    
    try {
        // Extract the sections
        const introMatch = content.match(/Cultural Journey to [^\n]*\s*([\s\S]*?)(?=Day 1:|$)/i);
        const introduction = introMatch?.[1]?.trim() || `Welcome to ${destination}!`;
        
        // Extract days
        const days = [];
        for (let i = 1; i <= requestedDays; i++) {
            const dayRegex = new RegExp(`Day ${i}:[^\\n]*(.*?)(?=Day ${i+1}:|ESSENTIAL|PRACTICAL|INSIDER|$)`, 'is');
            const dayMatch = content.match(dayRegex);
            
            if (!dayMatch) continue;
            
            const dayContent = dayMatch[0].trim();
            
            // Extract day title
            const titleMatch = dayContent.match(/Day \d+:\s*([^\n]+)/i);
            const title = titleMatch?.[0]?.trim() || `Day ${i}`;
            
            // Extract day activities with simpler regexes
            const morningMatch = dayContent.match(/Morning[\s\S]*?(?=Lunch|Afternoon|Evening|$)/i);
            const lunchMatch = dayContent.match(/Lunch[\s\S]*?(?=Afternoon|Evening|$)/i);
            const afternoonMatch = dayContent.match(/Afternoon[\s\S]*?(?=Evening|$)/i);
            const eveningMatch = dayContent.match(/Evening[\s\S]*?(?=$)/i);
            
            days.push({
                title,
                activities: {
                    morning: morningMatch?.[0]?.trim() || "",
                    lunch: lunchMatch?.[0]?.trim() || "",
                    afternoon: afternoonMatch?.[0]?.trim() || "",
                    evening: eveningMatch?.[0]?.trim() || ""
                }
            });
        }
        
        // Extract the three main information sections
        // Essential Travel Information
        const essentialMatch = content.match(/ESSENTIAL TRAVEL INFORMATION:?([\s\S]*?)(?=PRACTICAL MATTERS|INSIDER KNOWLEDGE|$)/i);
        let essentialInfo = essentialMatch?.[1]?.trim() || "";
        
        // Practical Matters
        const practicalMatch = content.match(/PRACTICAL MATTERS:?([\s\S]*?)(?=INSIDER KNOWLEDGE|$)/i);
        let practicalInfo = practicalMatch?.[1]?.trim() || "";
        
        // Insider Knowledge
        const insiderMatch = content.match(/INSIDER KNOWLEDGE:?([\s\S]*?)(?=$)/i);
        let insiderInfo = insiderMatch?.[1]?.trim() || "";
        
        // Extract subsections from each main section
        const essentialSections = [
            "LANGUAGE BASICS", "GETTING AROUND", "CULTURAL KNOW-HOW", 
            "FOOD GUIDE", "VISITOR TIPS"
        ];
        
        const practicalSections = [
            "SEASONAL ADVICE", "SAFETY & HEALTH", "MONEY MATTERS", 
            "PACKING LIST", "BUDGET PLANNING"
        ];
        
        const insiderSections = [
            "HIDDEN GEMS", "LOCAL FESTIVALS", "SHOPPING GUIDE"
        ];
        
        // Compile all info into appropriate sections
        return {
            title: `Cultural Journey to ${destination}`,
            subtitle: "Crafted with YatraGPT",
            destination: destination.toUpperCase(),
            introduction,
            days,
            essentialTravelInfo: formatSection(essentialInfo, essentialSections, "ESSENTIAL TRAVEL INFORMATION"),
            practicalMatters: formatSection(practicalInfo, practicalSections, "PRACTICAL MATTERS"),
            insiderKnowledge: formatSection(insiderInfo, insiderSections, "INSIDER KNOWLEDGE"),
            generatedDate: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error parsing itinerary:", error);
        throw new Error(`Failed to parse itinerary: ${error.message}`);
    }
};

// Helper function to format a section with subsections
function formatSection(content, sectionNames, fallbackTitle) {
    // If content is empty, return just the title
    if (!content || content.trim() === "") {
        return fallbackTitle;
    }
    
    // Check if content already has structured format
    if (content.includes(sectionNames[0])) {
        return `${fallbackTitle}\n${content}`;
    }
    
    // Simple extraction based on line breaks and bullet points
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const formattedContent = [];
    
    // Process lines and try to match them to section names
    let currentSection = "";
    
    for (const line of lines) {
        // Check if line starts with a bullet or number
        const isBulletPoint = /^[•\-*]|^\d+\./.test(line.trim());
        
        // Try to identify if this is a section heading
        const sectionMatch = sectionNames.find(section => 
            line.toUpperCase().includes(section) ||
            line.toUpperCase().includes(section.replace(/_/g, ' '))
        );
        
        if (sectionMatch || (line.toUpperCase() === line.trim().toUpperCase() && line.length < 50)) {
            // This is likely a section heading
            currentSection = sectionMatch || line.trim();
            formattedContent.push(`• **${currentSection}**:`);
        } else if (isBulletPoint && currentSection) {
            // This is a bullet point under a section
            formattedContent.push(`  ${line.trim()}`);
        } else if (currentSection) {
            // This is content for the current section
            formattedContent.push(`  ${line.trim()}`);
        } else {
            // Standalone content without a section
            formattedContent.push(line.trim());
        }
    }
    
    return `${fallbackTitle}\n${formattedContent.join('\n')}`;
}

// Create a simplified prompt for recommendations
const createRecommendationsPrompt = (preferences) => {
    const { destination, interests, travelStyle, additionalRequests } = preferences;
    
    return `Provide 5 specific cultural travel recommendations for ${destination || 'my destination'}.

Traveler interests: ${interests?.join(', ') || 'authentic cultural experiences'}
Travel style: ${travelStyle || 'balanced between popular and off-the-beaten-path'}
Special requests: ${additionalRequests || 'none'}

For each recommendation:
1. Start with a clear title
2. Include the specific venue or experience name
3. Explain its cultural significance
4. Provide practical details like location, cost, or timing
5. Format all venue and attraction names in **bold**`;
};

// Parse recommendations response
const parseRecommendationsResponse = (data) => {
    // Extract the text content from the API response
    if (!data.choices || !data.choices[0]) {
        throw new Error("Invalid API response format");
    }
    
    const choice = data.choices[0];
    const content = choice.message?.content || choice.content || choice.text || "";
    
    if (!content) {
        throw new Error("No content found in API response");
    }
    
    // Simple numbered list extraction
    const recommendations = [];
    const recRegex = /(\d+\.|•)\s+(?:\*\*)?([^:*]+)(?:\*\*)?:?\s+(.+?)(?=(?:\d+\.|•)|$)/gs;
    
    let match;
    while ((match = recRegex.exec(content)) !== null) {
        if (match[2] && match[3]) {
            recommendations.push({
                title: match[2].trim(),
                content: match[3].trim(),
                type: "recommendation",
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // If no recommendations found using the above regex, try paragraphs
    if (recommendations.length === 0) {
        const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            if (para.length > 20) {
                const titleMatch = para.match(/^(?:\d+\.\s*)?([^.!?]+)[.!?]/);
                const title = titleMatch?.[1]?.trim() || `Recommendation ${i+1}`;
                recommendations.push({
                    title,
                    content: para,
                    type: "recommendation",
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    
    return recommendations;
};

export default aiService;