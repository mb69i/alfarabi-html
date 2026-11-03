// ── AIZA - Al-Farabi AI Academic Advisor Widget ───────────────────────
// Bilingual (English & Arabic), instant intelligent fallback, customizable endpoint.

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
  initChatWidget();
}

function initChatWidget() {
  // Inject CSS if not already present
  if (!document.querySelector('link[href*="chat-widget.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/chat-widget.css';
    document.head.appendChild(link);
  }

  const isRTL = (document.documentElement.getAttribute('dir') === 'rtl') || 
                (localStorage.getItem('alfarabi-locale') === 'ar');

  const contentEN = {
    title: 'AIZA — AI Academic Advisor',
    statusActive: 'Active & Online',
    greeting: "Hello! I'm AIZA, your AI academic advisor at Al-Farabi University. I can guide you through our AI Engineering programs, 6 specialized research labs, admissions roadmap, and scholarships. How may I assist you today?",
    inputPlaceholder: 'Ask AIZA anything about AI Engineering...',
    chips: [
      'What programs do you offer?',
      'Tell me about research labs',
      'How do I apply for admission?',
      'Scholarship opportunities'
    ],
    configPrompt: 'Custom AI Endpoint (Optional):'
  };

  const contentAR = {
    title: 'عايزة (AIZA) — المستشارة الأكاديمية الذكية',
    statusActive: 'متصلة وجاهزة للمساعدة',
    greeting: 'مرحباً بك! أنا عايزة (AIZA)، المستشارة الأكاديمية الذكية لقسم هندسة الذكاء الاصطناعي في جامعة الفارابي. يمكنني إرشادك حول البرامج الدراسية، المختبرات البحثية الستة، مسار القبول، والمنح والتسجيل. كيف يمكنني مساعدتك اليوم؟',
    inputPlaceholder: 'اسأل عايزة عن هندسة الذكاء الاصطناعي...',
    chips: [
      'ما هي البرامج الأكاديمية المتاحة؟',
      'أخبريني عن المختبرات البحثية الستة',
      'ما هي خطوات وشروط القبول؟',
      'المنح والتخفيضات الدراسية'
    ],
    configPrompt: 'رابط الخادم المخصص (اختياري):'
  };

  const c = isRTL ? contentAR : contentEN;

  // Widget HTML
  const widgetHTML = `
    <!-- Floating Button (AI Core) -->
    <div class="ai-chat-fab" id="ai-chat-fab" aria-label="Open AI Assistant" title="AIZA Academic Advisor">
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
    <div class="ai-chat-window" id="ai-chat-window" style="${isRTL ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'}">
      <div class="ai-chat-header" id="ai-chat-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="ai-status-dot" id="ai-status-dot"></div>
          <span style="font-weight: 700;">${c.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="ai-toggle-config" style="background: none; border: none; color: var(--ai-gold, #c9a84c); cursor: pointer; padding: 2px;" title="Config Endpoint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button id="ai-close-btn" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 16px; line-height: 1;" title="Close">&times;</button>
        </div>
      </div>
      
      <div class="ai-api-setup" id="ai-api-setup" style="display: none;">
        <label style="font-size: 0.75rem; color: var(--ai-gold, #c9a84c); display: block; margin-bottom: 4px;">${c.configPrompt}</label>
        <div style="display:flex; gap: 6px;">
          <input type="text" id="ai-api-key" placeholder="http://localhost:5000/api/chat" style="flex:1; font-size: 12px; padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); color: #fff;">
          <button id="ai-save-key" style="background: var(--ai-gold, #c9a84c); color: #02040f; border: none; border-radius: 6px; padding: 4px 10px; font-weight: 700; cursor: pointer; font-size: 12px;">Save</button>
        </div>
      </div>

      <div class="ai-chat-body" id="ai-chat-body">
        <div class="ai-msg ai-msg-bot">${c.greeting}</div>
      </div>
      
      <div class="ai-chips" id="ai-chips">
        ${c.chips.map(chip => `<div class="ai-chip">${chip}</div>`).join('')}
      </div>

      <div class="ai-chat-footer">
        <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="${c.inputPlaceholder}" autocomplete="off">
        <button class="ai-chat-send" id="ai-chat-send" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // References
  const fab = document.getElementById('ai-chat-fab');
  const chatWindow = document.getElementById('ai-chat-window');
  const chatBody = document.getElementById('ai-chat-body');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSend = document.getElementById('ai-chat-send');
  const apiKeyInput = document.getElementById('ai-api-key');
  const saveKeyBtn = document.getElementById('ai-save-key');
  const toggleConfigBtn = document.getElementById('ai-toggle-config');
  const closeBtn = document.getElementById('ai-close-btn');
  const apiSetupDiv = document.getElementById('ai-api-setup');
  const chipsContainer = document.getElementById('ai-chips');

  let conversationHistory = [];
  let isThinking = false;

  // Pre-load saved custom URL if any
  const savedUrl = localStorage.getItem('ai_custom_endpoint');
  if (savedUrl) apiKeyInput.value = savedUrl;

  toggleConfigBtn.addEventListener('click', () => {
    apiSetupDiv.style.display = apiSetupDiv.style.display === 'none' ? 'block' : 'none';
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });

  fab.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      chatInput.focus();
    }
  });

  saveKeyBtn.addEventListener('click', () => {
    const url = apiKeyInput.value.trim();
    if (url) {
      localStorage.setItem('ai_custom_endpoint', url);
      apiSetupDiv.style.display = 'none';
      appendMessage('bot', isRTL ? 'تم حفظ عنوان الخادم المخصص بنجاح.' : 'Custom AI endpoint saved successfully.');
    } else {
      localStorage.removeItem('ai_custom_endpoint');
      apiSetupDiv.style.display = 'none';
      appendMessage('bot', isRTL ? 'تم تفعيل المستشار الداخلي الذكي.' : 'Built-in department advisor activated.');
    }
  });

  // ── Smart Bilingual Knowledge Engine ───────────────────────────────
  function queryKnowledgeBase(query, lang) {
    const q = query.toLowerCase();
    
    if (lang === 'ar') {
      if (q.includes('برنامج') || q.includes('برامج') || q.includes('تخصص') || q.includes('دراسة') || q.includes('بكالوريوس') || q.includes('مواد')) {
        return "يقدم قسم هندسة الذكاء الاصطناعي في جامعة الفارابي برنامج بكالوريوس متميزاً ومعتمداً لمدة 4 سنوات، يغطي:\n• التعلم الآلي والتعلم العميق (Deep Learning)\n• معالجة اللغات الطبيعية (NLP) والنماذج التأسيسية\n• الأنظمة الذاتية والروبوتات المتقدمة (Robotics)\n• الرؤية الحاسوبية والذكاء المكاني (Computer Vision)\n• هندسة البرمجيات الذكية وأخلاقيات وأمان الذكاء الاصطناعي.";
      }
      if (q.includes('مختبر') || q.includes('مختبرات') || q.includes('بحث') || q.includes('أبحاث') || q.includes('مراكز')) {
        return "يحتضن القسم 6 مختبرات ومراكز بحثية متطورة:\n1. مختبر البنى العصبية المتقدمة (Neural Architecture Lab)\n2. مختبر الأنظمة الذاتية والروبوتات (Robotics & UAVs)\n3. مركز معالجة اللغات الطبيعية (NLP & Arabic LLMs)\n4. مختبر الرؤية الحاسوبية والإدراك المكاني (Computer Vision)\n5. مركز سلامة وأخلاقيات الذكاء الاصطناعي (AI Ethics & Safety)\n6. مختبر الحوسبة والتعلم الكمومي (Quantum ML Lab).";
      }
      if (q.includes('قبول') || q.includes('تقديم') || q.includes('شروط') || q.includes('معدل') || q.includes('تسجيل')) {
        return "مسار القبول لعام 2026 / 2027 يتألف من 5 مراحل واضحة:\n1. التقديم الإلكتروني عبر بوابة الجامعة.\n2. تدقيق وثائق الفرع العلمي / التطبيقي / الأحيائي.\n3. اختبار الكفاءة والرياضيات والمنطق البرمجي.\n4. المقابلة الشخصية مع الهيئة التدريسية.\n5. إصدار وثيقة القبول والبدء بالأسبوع التعريفي.\nالحدود الدنيا تخضع لضوابط وزارة التعليم العالي والبحث العلمي.";
      }
      if (q.includes('منح') || q.includes('منحة') || q.includes('تخفيض') || q.includes('أقساط') || q.includes('سعر') || q.includes('تكلفة')) {
        return "توفر جامعة الفارابي منحاً دراسية وتخفيضات تصل حتى 50% للطلبة المتفوقين في امتحانات الكفاءة الوزارية، بالإضافة إلى خصومات خاصة للطلبة الأوائل والمتميزين في مسابقات الابتكار التقني والبرمجة.";
      }
      if (q.includes('مكان') || q.includes('موقع') || q.includes('عنوان') || q.includes('بغداد') || q.includes('دوام')) {
        return "يقع قسم هندسة الذكاء الاصطناعي في الحرم الرئيسي لجامعة الفارابي في العاصمة بغداد، ويوفر بنية تحتية فائقة التجهيز من مختبرات حوسبة فائقة الأداء (GPU clusters)، قاعات ذكية، ومكتبة بحثية شاملة.";
      }
      if (q.includes('مرحبا') || q.includes('أهلا') || q.includes('سلام')) {
        return "أهلاً وسهلاً بك! أنا عايزة (AIZA) رفيقتك الذكية في قسم هندسة الذكاء الاصطناعي. كيف يمكنني إفادتك اليوم؟";
      }
      return "شكراً لسؤالك! بخصوص هذا الاستفسار، يمكنك مراجعة قسم شؤون الطلبة والتسجيل في الحرم الجامعي، أو استكشاف صفحة البرامج والأخبار في الموقع. هل ترغب بأن أساعدك في معرفة تفاصيل القبول أو المختبرات البحثية؟";
    } else {
      // English
      if (q.includes('program') || q.includes('degree') || q.includes('curriculum') || q.includes('study') || q.includes('course') || q.includes('bachelor')) {
        return "The AI Engineering Department offers a prestigious 4-year B.Sc. in Artificial Intelligence Engineering, structured across:\n• Machine Learning & Deep Neural Topologies\n• Multilingual Large Language Models & NLP\n• Autonomous Robotics, UAVs & Spatial Navigation\n• Computer Vision & Neural Rendering\n• AI Safety, Alignment & Quantum Machine Learning.";
      }
      if (q.includes('lab') || q.includes('research') || q.includes('facility') || q.includes('paper')) {
        return "Our department spearheads 6 dedicated research laboratories:\n1. Neural Architecture Lab\n2. Autonomous Systems & Robotics Lab\n3. Natural Language Processing Center\n4. Computer Vision & Perception Lab\n5. AI Ethics & Safety Institute\n6. Quantum Machine Learning Lab.";
      }
      if (q.includes('apply') || q.includes('admission') || q.includes('requirement') || q.includes('eligibility') || q.includes('score')) {
        return "The 2026/2027 Admissions process consists of 5 streamlined milestones:\n1. Online Application submission.\n2. Credential & High School transcript verification.\n3. Aptitude exam covering algorithmic logic and mathematics.\n4. Academic interview with department faculty.\n5. Official acceptance and enrollment package orientation.";
      }
      if (q.includes('scholarship') || q.includes('tuition') || q.includes('fee') || q.includes('cost') || q.includes('financial')) {
        return "Al-Farabi University offers merit-based scholarships up to 50% tuition reduction for top-performing applicants, national olympiad medalists, and high-achieving high school graduates entering the scientific track.";
      }
      if (q.includes('where') || q.includes('location') || q.includes('campus') || q.includes('baghdad')) {
        return "The AI Engineering Department is located at Al-Farabi University's state-of-the-art campus in Baghdad, equipped with dedicated high-performance GPU compute clusters and collaborative research spaces.";
      }
      if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return "Hello! I'm AIZA, your dedicated AI academic advisor. How can I help guide your AI engineering journey today?";
      }
      return "Thank you for asking! For specialized inquiries or personalized consultations, please connect with our admissions office on campus or reach out via our Contact page. Would you like details on our academic programs or research laboratories?";
    }
  }

  // Send Message Logic
  const sendMessage = async (text) => {
    if (!text || isThinking) return;
    
    appendMessage('user', text);
    chatInput.value = '';
    if (chipsContainer) chipsContainer.style.display = 'none';

    conversationHistory.push({ role: 'user', content: text });

    // Typing indicator
    isThinking = true;
    const typingId = 'typing-' + Date.now();
    const typingHtml = `<div class="ai-typing" id="${typingId}"><span></span><span></span><span></span></div>`;
    chatBody.insertAdjacentHTML('beforeend', typingHtml);
    chatBody.scrollTop = chatBody.scrollHeight;

    const customUrl = localStorage.getItem('ai_custom_endpoint');

    if (customUrl) {
      try {
        const response = await fetch(customUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: conversationHistory })
        });
        const data = await response.json();
        const botEl = document.getElementById(typingId);
        if (botEl) botEl.remove();

        const botReply = data.reply || data.response || data.content || data.answer || "Response received.";
        appendMessage('bot', botReply);
        conversationHistory.push({ role: 'assistant', content: botReply });
        isThinking = false;
        return;
      } catch (e) {
        console.warn('[AIZA] Custom endpoint error, falling back to local advisor:', e);
      }
    }

    // Built-in intelligent answering
    setTimeout(() => {
      const botEl = document.getElementById(typingId);
      if (botEl) botEl.remove();

      const reply = queryKnowledgeBase(text, isRTL ? 'ar' : 'en');
      appendMessage('bot', reply);
      conversationHistory.push({ role: 'assistant', content: reply });
      isThinking = false;
    }, 450);
  };

  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-msg ai-msg-' + role;
    
    // Convert newlines to HTML line breaks
    let formatted = text.replace(/\n/g, '<br>');
    msgDiv.innerHTML = formatted;
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Event Listeners
  chatSend.addEventListener('click', () => sendMessage(chatInput.value.trim()));
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(chatInput.value.trim());
  });

  const chips = chatWindow.querySelectorAll('.ai-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      sendMessage(chip.textContent);
    });
  });
}
