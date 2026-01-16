// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

// Conversation history for context
let conversationHistory = [];

// Antonio's photos for variety
const antonioPhotos = [
    'Photo/7e3f9f09c75e2cb8946e76cefb701060.jpg',
    'Photo/76e58ee3fad78441e8d6050a0f6741bb.jpg',
    'Photo/a5c08e70845d162458783aac2da4e56b.jpg',
    'Photo/bbdd0075f81975047430096d9c893a31.jpg'
];

function getRandomPhoto() {
    return antonioPhotos[Math.floor(Math.random() * antonioPhotos.length)];
}

// Send message on button click or enter
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Add user message to UI
    addMessage(message, 'user');
    chatInput.value = '';

    // Add to history
    conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    const typingEl = showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history: conversationHistory.slice(-10) // Last 10 messages for context
            })
        });

        if (!response.ok) throw new Error('Failed to get response');

        const data = await response.json();

        // Remove typing indicator
        typingEl.remove();

        // Add bot response
        addMessage(data.response, 'bot');
        conversationHistory.push({ role: 'assistant', content: data.response });

    } catch (error) {
        console.error('Chat error:', error);
        typingEl.remove();

        // Fallback responses that sound like Antonio
        const fallbacks = [
            "lol my brain just lagged for a sec, can you say that again?",
            "yo sorry i got distracted - what were we talking about?",
            "haha my wifi is being weird rn, one sec",
            "wait i zoned out for a moment there, my bad"
        ];
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        addMessage(fallback, 'bot');
    }

    // Re-enable input
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${getRandomPhoto()}" alt="Antonio">
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${getRandomPhoto()}" alt="Antonio">
        </div>
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}
