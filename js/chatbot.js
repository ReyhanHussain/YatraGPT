// chatbot.js - Handles the floating chatbot functionality
import config from './config.js';
import { getAIResponse } from './chatbotAI.js';

// Create chatbot elements
const createChatbotElements = () => {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'floating-chatbot-container';
    chatbotContainer.style.display = 'none';
    
    chatbotContainer.innerHTML = `
        <div class="chatbot-header">
            <h3>Cultural Assistant</h3>
            <button class="close-chat-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="chatbot-messages">
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-robot"></i></div>
                <div class="chat-bubble">
                    <p>Hello! I'm your Cultural AI Assistant powered by Meta Llama. Ask me about any cultural customs, travel advice, or heritage sites around the world!</p>
                </div>
            </div>
        </div>
        <div class="chatbot-input">
            <input type="text" placeholder="Type your message...">
            <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
        </div>
        <div class="chatbot-status"></div>
    `;
    
    document.body.appendChild(chatbotContainer);
    
    return {
        container: chatbotContainer,
        messages: chatbotContainer.querySelector('.chatbot-messages'),
        input: chatbotContainer.querySelector('.chatbot-input input'),
        sendButton: chatbotContainer.querySelector('.send-btn'),
        closeButton: chatbotContainer.querySelector('.close-chat-btn'),
        status: chatbotContainer.querySelector('.chatbot-status')
    };
};

// Add a message to the chat
const addChatMessage = (container, sender, message) => {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    
    if (sender === 'user') {
        messageElement.innerHTML = `
            <div class="chat-bubble"><p>${message}</p></div>
            <div class="chat-avatar"><i class="fas fa-user"></i></div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-robot"></i></div>
            <div class="chat-bubble"><p></p></div>
        `;
    }
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
    
    // Return the message bubble element if it's a bot message
    // (so we can update it during typing animation)
    if (sender === 'bot') {
        return messageElement.querySelector('.chat-bubble p');
    }
    
    return null;
};

// Format the bot message with enhanced styling
const formatBotMessage = (messageElement, text) => {
    if (!messageElement) return;
    
    // Clean up duplicated text that might have been missed
    text = text.replace(/^(• .+)[\n\s]+\1$/gm, '$1');
    text = text.replace(/^([^•\n:]+)[\n\s]+\1$/gm, '$1');
    
    // Fix location names that repeat after a bullet
    text = text.replace(/(• [^:]+?)[\n\s]+([^•\n:]+?)(\s*:)/gm, (match, bullet, duplicate, colon) => {
        if (bullet.includes(duplicate.trim())) {
            return `${bullet}${colon}`;
        }
        return match;
    });
    
    // Format headings to be more compact
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<span class="bot-heading">$1</span>');
    
    // Format bullet points more elegantly
    formattedText = formattedText.replace(/^• (.*?)(?=\n|$)/gm, '<div class="bot-bullet"><span class="bullet-icon">•</span><span class="bullet-content">$1</span></div>');
    
    // Add minimal paragraph spacing
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Add basic CSS if it doesn't exist
    if (!document.getElementById('enhanced-chat-styles')) {
        const style = document.createElement('style');
        style.id = 'enhanced-chat-styles';
        style.textContent = `
            .bot-heading {
                font-weight: bold;
                color: #8A4117;
                display: block;
                margin: 6px 0 2px 0;
                padding-bottom: 2px;
                border-bottom: 1px solid rgba(138, 65, 23, 0.2);
            }
            .bot-bullet {
                margin: 2px 0;
                display: flex;
                align-items: flex-start;
            }
            .bullet-icon {
                flex-shrink: 0;
                margin-right: 5px;
                color: #8A4117;
            }
            .bullet-content {
                flex: 1;
            }
            .chat-bubble p {
                margin: 4px 0;
            }
            .chat-bubble br {
                display: block;
                margin: 2px 0;
                content: "";
            }
            .chatbot-status {
                font-size: 11px;
                text-align: center;
                color: #666;
                padding: 2px 0;
                height: 15px;
            }
            .typing-indicator {
                display: flex;
                justify-content: center;
                padding: 5px 0;
            }
            .typing-indicator span {
                height: 8px;
                width: 8px;
                background: #8A4117;
                border-radius: 50%;
                margin: 0 2px;
                display: inline-block;
                opacity: 0.4;
                animation: typing 1s infinite ease-in-out;
            }
            .typing-indicator span:nth-child(1) {
                animation-delay: 0s;
            }
            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes typing {
                0% { transform: translateY(0px); opacity: 0.4; }
                50% { transform: translateY(-5px); opacity: 0.8; }
                100% { transform: translateY(0px); opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
    }
    
    messageElement.innerHTML = formattedText;
};

// Update chatbot status
const updateStatus = (statusElement, text, isError = false) => {
    if (!statusElement) return;
    
    statusElement.textContent = text;
    statusElement.style.color = isError ? '#e74c3c' : '#666';
    
    // Clear status after a few seconds unless it's an error
    if (!isError && text) {
        setTimeout(() => {
            statusElement.textContent = '';
        }, 3000);
    }
};

// Function to handle user messages and get AI responses
const handleChatbotMessage = async (chatbot) => {
    const userMessage = chatbot.input.value.trim();
    if (!userMessage) return;
    
    // Clear input and add user message
    chatbot.input.value = '';
    addChatMessage(chatbot.messages, 'user', userMessage);
    
    // Create bot message with typing indicator
    const botBubble = addChatMessage(chatbot.messages, 'bot', '');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    botBubble.appendChild(typingIndicator);
    
    chatbot.messages.scrollTop = chatbot.messages.scrollHeight;
    
    // Update status with current model
    updateStatus(chatbot.status, `Using ${config.getCurrentModel().split('/').pop()}`);
    
    // Handle special command for API key
    if (userMessage.toLowerCase().startsWith('setapikey ')) {
        typingIndicator.remove();
        const apiKey = userMessage.substring(10).trim();
        if (apiKey && config.setApiKey(apiKey)) {
            formatBotMessage(botBubble, "API key updated successfully!");
            updateStatus(chatbot.status, "API key updated", false);
        } else {
            formatBotMessage(botBubble, "Failed to update API key. Please try again with a valid key.");
            updateStatus(chatbot.status, "Invalid API key", true);
        }
        return;
    }
    
    try {
        // Use the streaming callback to update the message in real-time
        await getAIResponse(userMessage, (progressText) => {
            // Remove typing indicator during updates
            if (typingIndicator.parentNode === botBubble) {
                typingIndicator.remove();
            }
            
            // Update with formatted text
            formatBotMessage(botBubble, progressText);
            chatbot.messages.scrollTop = chatbot.messages.scrollHeight;
        });
    } catch (error) {
        console.error("AI response error:", error);
        
        // Remove typing indicator and show error
        if (typingIndicator.parentNode === botBubble) {
            typingIndicator.remove();
        }
        formatBotMessage(botBubble, "Sorry, I couldn't connect to the AI service. Please check your internet connection and try again later.");
        updateStatus(chatbot.status, "Connection failed", true);
    }
};

// Initialize chatbot
const initChatbot = () => {
    const floatingChatButton = document.querySelector('.floating-chat-button');
    if (!floatingChatButton) return;
    
    const chatbot = createChatbotElements();
    
    // Verify using Meta Llama
    const currentModel = config.getCurrentModel();
    if (!currentModel.includes('meta-llama')) {
        console.warn(`Warning: Not using Meta Llama model. Current model: ${currentModel}`);
        // Force using Meta Llama
        config.AI_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
        console.log(`Switched to Meta Llama model: ${config.AI_MODEL}`);
    }
    
    // Toggle chatbot visibility
    floatingChatButton.addEventListener('click', () => {
        chatbot.container.style.display = chatbot.container.style.display === 'none' ? 'flex' : 'none';
        if (chatbot.container.style.display !== 'none') {
            chatbot.input.focus();
        }
    });
    
    // Close chatbot
    chatbot.closeButton.addEventListener('click', () => {
        chatbot.container.style.display = 'none';
    });
    
    // Send message when clicking send button
    chatbot.sendButton.addEventListener('click', () => {
        handleChatbotMessage(chatbot);
    });
    
    // Send message when pressing Enter key
    chatbot.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleChatbotMessage(chatbot);
        }
    });
    
    // Show model info in the status
    const modelName = config.getCurrentModel().split('/').pop();
    updateStatus(chatbot.status, `Powered by ${modelName}`);
    setTimeout(() => { updateStatus(chatbot.status, ''); }, 3000);
};

// Initialize chatbot when the page is loaded
document.addEventListener('DOMContentLoaded', initChatbot);

export { initChatbot }; 