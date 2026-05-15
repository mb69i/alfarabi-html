// AIZA - Al Farabi AI Assistant Chat Widget
// This script injects the floating chatbot into the page.

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
  initChatWidget();
}

function initChatWidget() {
  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/chat-widget.css';
  document.head.appendChild(link);

  // Widget HTML
  const widgetHTML = `
    <!-- Floating Button -->
    <div class="ai-chat-fab" id="ai-chat-fab" aria-label="Open AI Assistant">
      <div class="ai-core-ring-1"></div>
      <div class="ai-core-ring-2"></div>
      <div class="ai-core-ring-3"></div>
      <div class="ai-core-center">
        <div class="ai-core-bar"></div>
        <div class="ai-core-bar"></div>
        <div class="ai-core-bar"></div>
      </div>
    </div>

    <!-- Chat Window -->
    <div class="ai-chat-window" id="ai-chat-window">
      <div class="ai-chat-header">
        <div class="ai-status-dot inactive" id="ai-status-dot"></div>
        AIZA — AI Academic Advisor
      </div>
      
      <div class="ai-api-setup" id="ai-api-setup">
        <label style="font-size: 0.8rem; color: var(--ai-gold);">Enter DistilBERT Backend URL (e.g., http://localhost:5000/chat):</label>
        <div style="display:flex; gap: 6px;">
          <input type="text" id="ai-api-key" placeholder="http://..." style="flex:1" value="http://localhost:5000/api/chat">
          <button id="ai-save-key">Save</button>
        </div>
      </div>

      <div class="ai-chat-body" id="ai-chat-body">
        <div class="ai-msg ai-msg-bot">
          Hello! I'm AIZA, your AI academic advisor at Al Farabi University. I can help you explore our programs, research labs, admissions process, and more. What would you like to know?
        </div>
      </div>
      
      <div class="ai-chips" id="ai-chips">
        <div class="ai-chip">What programs do you offer?</div>
        <div class="ai-chip">How do I apply?</div>
        <div class="ai-chip">Tell me about research labs</div>
        <div class="ai-chip">Scholarship opportunities</div>
      </div>

      <div class="ai-chat-footer">
        <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Ask AIZA anything..." autocomplete="off">
        <button class="ai-chat-send" id="ai-chat-send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // Logic
  const fab = document.getElementById('ai-chat-fab');
  const chatWindow = document.getElementById('ai-chat-window');
  const chatBody = document.getElementById('ai-chat-body');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSend = document.getElementById('ai-chat-send');
  const apiKeyInput = document.getElementById('ai-api-key');
  const saveKeyBtn = document.getElementById('ai-save-key');
  const statusDot = document.getElementById('ai-status-dot');
  const apiSetupDiv = document.getElementById('ai-api-setup');
  const chips = document.querySelectorAll('.ai-chip');

  let conversationHistory = [];
  let isThinking = false;

  // Check if API endpoint is already set
  if (window.DISTILBERT_API_URL || localStorage.getItem('ai_demo_url')) {
    window.DISTILBERT_API_URL = window.DISTILBERT_API_URL || localStorage.getItem('ai_demo_url');
    statusDot.classList.remove('inactive');
    apiSetupDiv.style.display = 'none';
  }

  // Toggle Chat Window
  fab.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  });

  // Draggable logic for Chat Window
  const header = document.querySelector('.ai-chat-header');
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  header.addEventListener('mousedown', (e) => {
    // Convert right/bottom to fixed left/top on first drag
    if (!chatWindow.style.left) {
      const rect = chatWindow.getBoundingClientRect();
      chatWindow.style.left = rect.left + 'px';
      chatWindow.style.top = rect.top + 'px';
      chatWindow.style.right = 'auto';
      chatWindow.style.bottom = 'auto';
      chatWindow.style.transform = 'none'; // Overrides CSS transform
      chatWindow.style.transition = 'opacity 0.2s'; // Keep only opacity
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseInt(chatWindow.style.left, 10);
    initialTop = parseInt(chatWindow.style.top, 10);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    chatWindow.style.left = (initialLeft + dx) + 'px';
    chatWindow.style.top = (initialTop + dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Save API URL
  saveKeyBtn.addEventListener('click', () => {
    const url = apiKeyInput.value.trim();
    if (url) {
      window.DISTILBERT_API_URL = url;
      localStorage.setItem('ai_demo_url', url);
      statusDot.classList.remove('inactive');
      apiSetupDiv.style.display = 'none';
    }
  });

  // Send Message
  const sendMessage = async (text) => {
    if (!text || isThinking) return;
    
    // Add user message to UI
    appendMessage('user', text);
    chatInput.value = '';
    document.getElementById('ai-chips').style.display = 'none';

    if (!window.DISTILBERT_API_URL) {
      setTimeout(() => appendMessage('bot', 'Please enter your DistilBERT backend API URL above to activate AIZA.'), 500);
      return;
    }

    // Add to history
    conversationHistory.push({ role: 'user', content: text });

    // Show typing indicator
    isThinking = true;
    const typingId = 'typing-' + Date.now();
    const typingHtml = `<div class="ai-typing" id="${typingId}"><span></span><span></span><span></span></div>`;
    chatBody.insertAdjacentHTML('beforeend', typingHtml);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      // ────────────────────────────────────────────────────────────
      // DISTILBERT API INTEGRATION PLACEHOLDER
      // Replace the fetch call below with your actual API signature
      // when your DistilBERT model training is complete.
      // ────────────────────────────────────────────────────────────
      const response = await fetch(window.DISTILBERT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          history: conversationHistory
        })
      });
      
      const data = await response.json();
      const botEl = document.getElementById(typingId);
      if (botEl) botEl.remove();

      if (data.error) {
        appendMessage('bot', `Error: ${data.error}`);
      } else if (data.reply || data.response || data.content) {
        // Adapt this to match your DistilBERT JSON response key (e.g. data.reply)
        const botText = data.reply || data.response || data.content || "I'm sorry, I didn't understand the response from the server.";
        appendMessage('bot', botText);
        conversationHistory.push({ role: 'assistant', content: botText });
      }
    } catch (err) {
      const botEl = document.getElementById(typingId);
      if (botEl) botEl.remove();
      appendMessage('bot', "I'm having trouble connecting to my DistilBERT neural network right now. Make sure the backend server is running.");
    } finally {
      isThinking = false;
    }
  };

  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-msg ai-msg-' + role;
    
    // Convert basic markdown/newlines to HTML
    let htmlText = text.replace(/\\n/g, '<br>');
    msgDiv.innerHTML = htmlText;
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Event Listeners
  chatSend.addEventListener('click', () => sendMessage(chatInput.value.trim()));
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(chatInput.value.trim());
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      sendMessage(chip.textContent);
    });
  });
}
