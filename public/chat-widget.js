/**
 * City of Doral AI Chat Widget
 * Embeddable floating chat widget with RAG-powered responses
 * Bilingual (English/Spanish) support
 *
 * Features:
 * - Conversation history persistence (localStorage)
 * - Enhanced typing indicator
 * - Message timestamp grouping (Today/Yesterday/Date)
 * - Quick Actions menu
 * - Feedback API integration
 * - Full accessibility (WCAG 2.1 AA)
 * - Dynamic page-aware suggestions
 * - Conversation logging
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'http://localhost:3000/api/chat',
    feedbackUrl: 'http://localhost:3000/api/feedback',
    logUrl: 'http://localhost:3000/api/log',
    defaultLanguage: 'en',
    storageKey: 'doral_chat_history',
    sessionKey: 'doral_chat_session',
    maxMessages: 50,
    historyExpiry: 24 * 60 * 60 * 1000 // 24 hours in ms
  };

  // Generate unique IDs
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Bilingual labels
  const LABELS = {
    en: {
      title: 'City of Doral AI Assistant',
      subtitle: 'Always here to help',
      placeholder: 'Type your question...',
      send: 'Send',
      sources: 'Sources',
      feedback: 'Was this helpful?',
      escalateMessage: 'Would you like to speak with a city representative?',
      escalateButton: 'Talk to a Human',
      suggested: 'Suggested questions:',
      disclaimer: 'Powered by AI - Information may not always be accurate',
      typing: 'Doral AI is typing',
      today: 'Today',
      yesterday: 'Yesterday',
      clearHistory: 'Clear chat',
      quickActions: 'Quick Actions',
      suggestions: [
        'What are the city hall hours?',
        'How do I apply for a building permit?',
        'What events are coming up?',
        'Where are the parks located?'
      ],
      welcome: "Hello! I'm the City of Doral AI Assistant. I can help you with information about city services, permits, events, parks, and more. How can I assist you today?"
    },
    es: {
      title: 'Asistente Virtual de la Ciudad de Doral',
      subtitle: 'Siempre aquí para ayudar',
      placeholder: 'Escriba su pregunta...',
      send: 'Enviar',
      sources: 'Fuentes',
      feedback: '¿Fue útil?',
      escalateMessage: '¿Le gustaría hablar con un representante de la ciudad?',
      escalateButton: 'Hablar con un Representante',
      suggested: 'Preguntas sugeridas:',
      disclaimer: 'Impulsado por IA - La información puede no ser siempre precisa',
      typing: 'Doral AI está escribiendo',
      today: 'Hoy',
      yesterday: 'Ayer',
      clearHistory: 'Borrar chat',
      quickActions: 'Acciones Rápidas',
      suggestions: [
        '¿Cuál es el horario del ayuntamiento?',
        '¿Cómo solicito un permiso de construcción?',
        '¿Qué eventos hay próximamente?',
        '¿Dónde están los parques?'
      ],
      welcome: '¡Hola! Soy el Asistente Virtual de la Ciudad de Doral. Puedo ayudarle con información sobre servicios municipales, permisos, eventos, parques y más. ¿Cómo puedo asistirle hoy?'
    }
  };

  // Quick Actions
  const QUICK_ACTIONS = {
    en: [
      { id: 'report', label: 'Report Issue', icon: '📋', query: 'How do I report an issue to the city?' },
      { id: 'service', label: 'Find Service', icon: '🔍', query: 'What city services are available?' },
      { id: 'directions', label: 'Get Directions', icon: '📍', query: 'Where is City Hall located?' },
      { id: 'contact', label: 'Contact Dept', icon: '📞', query: 'How do I contact a city department?' },
      { id: 'hours', label: 'Check Hours', icon: '🕐', query: 'What are the city office hours?' }
    ],
    es: [
      { id: 'report', label: 'Reportar', icon: '📋', query: '¿Cómo reporto un problema a la ciudad?' },
      { id: 'service', label: 'Buscar Servicio', icon: '🔍', query: '¿Qué servicios ofrece la ciudad?' },
      { id: 'directions', label: 'Direcciones', icon: '📍', query: '¿Dónde está el Ayuntamiento?' },
      { id: 'contact', label: 'Contactar', icon: '📞', query: '¿Cómo contacto un departamento?' },
      { id: 'hours', label: 'Horarios', icon: '🕐', query: '¿Cuál es el horario de oficinas?' }
    ]
  };

  // Page-specific suggestions
  const PAGE_SUGGESTIONS = {
    en: {
      '/Government': [
        'Who is the Mayor of Doral?',
        'When is the next city council meeting?',
        'How can I contact my council member?'
      ],
      '/Departments': [
        'What departments does the city have?',
        'How do I reach the Building Department?',
        'What does Code Enforcement handle?'
      ],
      '/Residents': [
        'What services are available for residents?',
        'How do I sign up for utility services?',
        'Where can I find recycling information?'
      ],
      '/Business': [
        'How do I get a business license?',
        'What permits do I need to open a business?',
        'Are there business incentives available?'
      ],
      '/Parks': [
        'What parks are in Doral?',
        'What are the park hours?',
        'Can I reserve a pavilion?'
      ],
      '/Police': [
        'How do I contact Doral Police?',
        'Where is the police station?',
        'How do I file a police report?'
      ],
      default: [
        'What are the city hall hours?',
        'How do I apply for a building permit?',
        'What events are coming up?',
        'Where are the parks located?'
      ]
    },
    es: {
      '/Government': [
        '¿Quién es el Alcalde de Doral?',
        '¿Cuándo es la próxima reunión del concejo?',
        '¿Cómo contacto a mi concejal?'
      ],
      '/Departments': [
        '¿Qué departamentos tiene la ciudad?',
        '¿Cómo contacto al Departamento de Construcción?',
        '¿Qué maneja Cumplimiento de Códigos?'
      ],
      '/Residents': [
        '¿Qué servicios hay para residentes?',
        '¿Cómo me registro para servicios públicos?',
        '¿Dónde encuentro información de reciclaje?'
      ],
      '/Business': [
        '¿Cómo obtengo una licencia comercial?',
        '¿Qué permisos necesito para un negocio?',
        '¿Hay incentivos para negocios?'
      ],
      '/Parks': [
        '¿Qué parques hay en Doral?',
        '¿Cuál es el horario de los parques?',
        '¿Puedo reservar un pabellón?'
      ],
      '/Police': [
        '¿Cómo contacto a la Policía de Doral?',
        '¿Dónde está la estación de policía?',
        '¿Cómo presento un reporte policial?'
      ],
      default: [
        '¿Cuál es el horario del ayuntamiento?',
        '¿Cómo solicito un permiso de construcción?',
        '¿Qué eventos hay próximamente?',
        '¿Dónde están los parques?'
      ]
    }
  };

  // SVG Icons (all with fill="currentColor" for proper rendering)
  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>'
  };

  // State
  let state = {
    isOpen: false,
    language: CONFIG.defaultLanguage,
    messages: [],
    isLoading: false,
    sessionId: null,
    conversationId: null,
    lastActivity: null,
    actionsOpen: false,
    suggestionsVisible: true
  };

  // DOM Elements
  let elements = {};

  // ==================== STORAGE FUNCTIONS ====================

  function getSession() {
    try {
      const stored = localStorage.getItem(CONFIG.sessionKey);
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is still valid (24h)
        if (Date.now() - session.createdAt < CONFIG.historyExpiry) {
          return session;
        }
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    // Create new session
    const newSession = {
      id: generateId('sess'),
      createdAt: Date.now()
    };
    localStorage.setItem(CONFIG.sessionKey, JSON.stringify(newSession));
    return newSession;
  }

  function loadConversation() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if history is still valid (24h)
        if (Date.now() - data.lastActivity < CONFIG.historyExpiry) {
          return {
            messages: data.messages.slice(-CONFIG.maxMessages),
            conversationId: data.conversationId,
            language: data.language || CONFIG.defaultLanguage
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load conversation:', e);
    }
    return null;
  }

  function saveConversation() {
    try {
      const data = {
        messages: state.messages.slice(-CONFIG.maxMessages),
        conversationId: state.conversationId,
        language: state.language,
        lastActivity: Date.now()
      };
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save conversation:', e);
    }
  }

  function clearConversation() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
      state.messages = [];
      state.conversationId = generateId('conv');
      state.suggestionsVisible = true;
      elements.messages.innerHTML = '';
      addWelcomeMessage();
      elements.suggestions.classList.remove('doral-hidden');
      updateSuggestionsForPage();
    } catch (e) {
      console.warn('Failed to clear conversation:', e);
    }
  }

  // ==================== PAGE CONTEXT FUNCTIONS ====================

  function getCurrentPageContext() {
    const path = window.location.pathname;
    // Match page sections
    for (const key of Object.keys(PAGE_SUGGESTIONS.en)) {
      if (key !== 'default' && path.includes(key)) {
        return key;
      }
    }
    return 'default';
  }

  function getSuggestionsForPage() {
    const context = getCurrentPageContext();
    const langSuggestions = PAGE_SUGGESTIONS[state.language] || PAGE_SUGGESTIONS.en;
    return langSuggestions[context] || langSuggestions.default;
  }

  function updateSuggestionsForPage() {
    const suggestions = getSuggestionsForPage();
    elements.suggestionsList.innerHTML = suggestions
      .map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`)
      .join('');
  }

  // ==================== DATE/TIME FUNCTIONS ====================

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function isYesterday(today, date) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(yesterday, date);
  }

  function formatMessageDate(timestamp) {
    const now = new Date();
    const msgDate = new Date(timestamp);
    const labels = LABELS[state.language];

    if (isSameDay(now, msgDate)) return labels.today;
    if (isYesterday(now, msgDate)) return labels.yesterday;
    return msgDate.toLocaleDateString(state.language === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function shouldShowDateHeader(message, index) {
    if (index === 0) return true;
    const prevMsg = state.messages[index - 1];
    if (!prevMsg) return true;
    const prevDate = new Date(prevMsg.timestamp);
    const currDate = new Date(message.timestamp);
    return !isSameDay(prevDate, currDate);
  }

  // ==================== INITIALIZATION ====================

  function init() {
    // Get or create session
    const session = getSession();
    state.sessionId = session.id;

    // Load existing conversation
    const savedConvo = loadConversation();
    if (savedConvo) {
      state.messages = savedConvo.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      state.conversationId = savedConvo.conversationId;
      state.language = savedConvo.language;
    } else {
      state.conversationId = generateId('conv');
    }

    createWidget();
    addEventListeners();

    // Render existing messages or add welcome
    if (state.messages.length > 0) {
      renderAllMessages();
      // Hide suggestions if there are user messages
      if (state.messages.some(m => m.role === 'user')) {
        state.suggestionsVisible = false;
        elements.suggestions.classList.add('doral-hidden');
      }
    } else {
      addWelcomeMessage();
    }
  }

  // ==================== WIDGET CREATION ====================

  function createWidget() {
    // FAB Button
    const fab = document.createElement('button');
    fab.className = 'doral-chat-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = `
      <span class="doral-chat-icon">${ICONS.chat}</span>
      <span class="doral-close-icon">${ICONS.close}</span>
    `;
    document.body.appendChild(fab);
    elements.fab = fab;

    // Chat Panel
    const panel = document.createElement('div');
    panel.className = 'doral-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with City of Doral Assistant');
    panel.setAttribute('aria-modal', 'true');
    panel.innerHTML = createPanelHTML();
    document.body.appendChild(panel);
    elements.panel = panel;

    // Cache elements
    elements.header = panel.querySelector('.doral-chat-header');
    elements.title = panel.querySelector('.doral-chat-title');
    elements.subtitle = panel.querySelector('.doral-chat-subtitle');
    elements.langBtn = panel.querySelector('.doral-chat-lang-btn');
    elements.clearBtn = panel.querySelector('.doral-chat-clear-btn');
    elements.closeBtn = panel.querySelector('.doral-chat-close-btn');
    elements.messages = panel.querySelector('.doral-chat-messages');
    elements.quickActions = panel.querySelector('.doral-chat-quick-actions');
    elements.quickActionsList = panel.querySelector('.doral-chat-quick-actions-list');
    elements.suggestions = panel.querySelector('.doral-chat-suggestions');
    elements.suggestionsLabel = panel.querySelector('.doral-chat-suggestions-label');
    elements.suggestionsList = panel.querySelector('.doral-chat-suggestions-list');
    elements.input = panel.querySelector('.doral-chat-input');
    elements.sendBtn = panel.querySelector('.doral-chat-send-btn');
    elements.disclaimer = panel.querySelector('.doral-chat-disclaimer');
    elements.actionsToggle = panel.querySelector('.doral-chat-actions-toggle');
  }

  function createPanelHTML() {
    const labels = LABELS[state.language];
    const actions = QUICK_ACTIONS[state.language];
    const suggestions = getSuggestionsForPage();

    return `
      <div class="doral-chat-header">
        <div class="doral-chat-header-left">
          <div class="doral-chat-avatar">${ICONS.bot}</div>
          <div>
            <h2 class="doral-chat-title">${labels.title}</h2>
            <p class="doral-chat-subtitle">${labels.subtitle}</p>
          </div>
        </div>
        <div class="doral-chat-header-right">
          <button class="doral-chat-lang-btn" aria-label="Switch language" title="Ctrl+L">
            ${ICONS.globe}
            <span>${state.language.toUpperCase()}</span>
          </button>
          <button class="doral-chat-clear-btn" aria-label="${labels.clearHistory}" title="${labels.clearHistory}">
            ${ICONS.trash}
          </button>
          <button class="doral-chat-close-btn" aria-label="Close chat" title="Escape">
            ${ICONS.close}
          </button>
        </div>
      </div>
      <div class="doral-chat-messages" aria-live="polite" role="log" aria-label="Chat messages"></div>
      <div class="doral-chat-quick-actions">
        <p class="doral-chat-quick-actions-label">${labels.quickActions}:</p>
        <div class="doral-chat-quick-actions-list">
          ${actions.map(a => `<button class="doral-chat-quick-action-btn" data-query="${escapeHtml(a.query)}" aria-label="${a.label}"><span class="doral-action-icon">${a.icon}</span><span>${a.label}</span></button>`).join('')}
        </div>
      </div>
      <div class="doral-chat-suggestions">
        <p class="doral-chat-suggestions-label">${labels.suggested}</p>
        <div class="doral-chat-suggestions-list">
          ${suggestions.map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`).join('')}
        </div>
      </div>
      <div class="doral-chat-input-area">
        <div class="doral-chat-input-row">
          <button type="button" class="doral-chat-actions-toggle" aria-label="${labels.quickActions}" aria-expanded="false" title="${labels.quickActions}">
            ${ICONS.menu}
          </button>
          <form class="doral-chat-input-form">
            <input type="text" class="doral-chat-input" placeholder="${labels.placeholder}" aria-label="${labels.placeholder}">
            <button type="submit" class="doral-chat-send-btn" aria-label="${labels.send}" disabled>
              ${ICONS.send}
            </button>
          </form>
        </div>
        <p class="doral-chat-disclaimer">${labels.disclaimer}</p>
      </div>
    `;
  }

  // ==================== EVENT LISTENERS ====================

  function addEventListeners() {
    // FAB click
    elements.fab.addEventListener('click', toggleChat);

    // Language toggle
    elements.langBtn.addEventListener('click', toggleLanguage);

    // Clear history
    elements.clearBtn.addEventListener('click', clearConversation);

    // Close button in header
    elements.closeBtn.addEventListener('click', toggleChat);

    // Actions toggle
    elements.actionsToggle.addEventListener('click', toggleQuickActions);

    // Input handling
    elements.input.addEventListener('input', function() {
      elements.sendBtn.disabled = !this.value.trim();
    });

    // Form submit
    elements.panel.querySelector('.doral-chat-input-form').addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage();
    });

    // Quick action clicks
    elements.quickActionsList.addEventListener('click', function(e) {
      const btn = e.target.closest('.doral-chat-quick-action-btn');
      if (btn) {
        const query = btn.dataset.query;
        elements.input.value = query;
        elements.sendBtn.disabled = false;
        sendMessage();
      }
    });

    // Suggestion clicks
    elements.suggestionsList.addEventListener('click', function(e) {
      if (e.target.classList.contains('doral-chat-suggestion-btn')) {
        elements.input.value = e.target.textContent;
        elements.sendBtn.disabled = false;
        sendMessage();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      // Escape to close
      if (e.key === 'Escape' && state.isOpen) {
        toggleChat();
        elements.fab.focus();
      }
      // Ctrl+L to toggle language
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        toggleLanguage();
      }
    });

    // Focus trap when panel is open
    elements.panel.addEventListener('keydown', trapFocus);
  }

  // ==================== FOCUS MANAGEMENT ====================

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = elements.panel.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ==================== CHAT FUNCTIONS ====================

  function toggleChat() {
    state.isOpen = !state.isOpen;
    elements.fab.classList.toggle('doral-chat-open', state.isOpen);
    elements.fab.setAttribute('aria-expanded', state.isOpen.toString());
    elements.panel.classList.toggle('doral-chat-visible', state.isOpen);

    if (state.isOpen) {
      elements.input.focus();
      scrollToBottom();
    }
  }

  function toggleLanguage() {
    state.language = state.language === 'en' ? 'es' : 'en';
    updateLabels();
    saveConversation();
  }

  function toggleQuickActions() {
    state.actionsOpen = !state.actionsOpen;
    elements.quickActions.classList.toggle('doral-expanded', state.actionsOpen);
    elements.actionsToggle.classList.toggle('doral-expanded', state.actionsOpen);
    elements.actionsToggle.setAttribute('aria-expanded', state.actionsOpen.toString());
  }

  function hideSuggestions() {
    if (state.suggestionsVisible) {
      state.suggestionsVisible = false;
      elements.suggestions.classList.add('doral-hidden');
    }
  }

  function updateLabels() {
    const labels = LABELS[state.language];
    const actions = QUICK_ACTIONS[state.language];

    elements.title.textContent = labels.title;
    elements.subtitle.textContent = labels.subtitle;
    elements.langBtn.querySelector('span').textContent = state.language.toUpperCase();
    elements.input.placeholder = labels.placeholder;
    elements.clearBtn.setAttribute('aria-label', labels.clearHistory);
    elements.clearBtn.setAttribute('title', labels.clearHistory);
    elements.disclaimer.textContent = labels.disclaimer;

    // Update quick actions
    elements.quickActionsList.innerHTML = actions
      .map(a => `<button class="doral-chat-quick-action-btn" data-query="${escapeHtml(a.query)}" aria-label="${a.label}"><span class="doral-action-icon">${a.icon}</span><span>${a.label}</span></button>`)
      .join('');

    // Update quick actions label
    const actionsLabel = elements.quickActions.querySelector('.doral-chat-quick-actions-label');
    if (actionsLabel) actionsLabel.textContent = labels.quickActions + ':';

    // Update suggestions
    elements.suggestionsLabel.textContent = labels.suggested;
    updateSuggestionsForPage();

    // Update actions toggle
    elements.actionsToggle.setAttribute('aria-label', labels.quickActions);
    elements.actionsToggle.setAttribute('title', labels.quickActions);
  }

  function addWelcomeMessage() {
    const labels = LABELS[state.language];
    addMessage('assistant', labels.welcome, {}, false);
  }

  function addMessage(role, content, data = {}, save = true) {
    const message = {
      id: generateId('msg'),
      role,
      content,
      timestamp: new Date(),
      sources: data.sources || [],
      escalate: data.escalate || false,
      feedback: null
    };
    state.messages.push(message);

    // Get the index for date header check
    const index = state.messages.length - 1;

    // Add date header if needed
    if (shouldShowDateHeader(message, index)) {
      renderDateHeader(message.timestamp);
    }

    renderMessage(message);
    scrollToBottom();

    // Save to localStorage
    if (save) {
      saveConversation();
    }

    // Hide suggestions after first user message
    if (role === 'user' && state.messages.filter(m => m.role === 'user').length === 1) {
      hideSuggestions();
    }
  }

  function renderAllMessages() {
    elements.messages.innerHTML = '';
    state.messages.forEach((message, index) => {
      if (shouldShowDateHeader(message, index)) {
        renderDateHeader(message.timestamp);
      }
      renderMessage(message);
    });
    scrollToBottom();
  }

  function renderDateHeader(timestamp) {
    const headerEl = document.createElement('div');
    headerEl.className = 'doral-chat-date-header';
    headerEl.setAttribute('role', 'separator');
    headerEl.innerHTML = `<span>${formatMessageDate(timestamp)}</span>`;
    elements.messages.appendChild(headerEl);
  }

  function renderMessage(message) {
    const labels = LABELS[state.language];
    const isUser = message.role === 'user';

    const messageEl = document.createElement('div');
    messageEl.className = `doral-chat-message ${isUser ? 'doral-user' : 'doral-assistant'}`;
    messageEl.setAttribute('data-id', message.id);

    let html = `
      <div class="doral-chat-message-avatar">
        ${isUser ? ICONS.user : ICONS.bot}
      </div>
      <div class="doral-chat-message-content">
        <div class="doral-chat-bubble">${escapeHtml(message.content)}</div>
        <span class="doral-chat-time">${formatTime(message.timestamp)}</span>
    `;

    // Add sources for assistant messages
    if (!isUser && message.sources && message.sources.length > 0) {
      html += `
        <div class="doral-chat-sources">
          <span class="doral-chat-sources-label">${labels.sources}:</span>
          ${message.sources.slice(0, 3).map(s => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="doral-chat-source-link">
              ${ICONS.external}
              ${escapeHtml(s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title)}
            </a>
          `).join('')}
        </div>
      `;
    }

    // Add escalation for frustrated users
    if (!isUser && message.escalate) {
      html += `
        <div class="doral-chat-escalation">
          <div class="doral-chat-escalation-header">
            ${ICONS.warning}
            <span>${labels.escalateMessage}</span>
          </div>
          <button class="doral-chat-escalation-btn" onclick="window.location.href='tel:+13055936725'">
            ${ICONS.phone}
            ${labels.escalateButton}
          </button>
        </div>
      `;
    }

    // Add feedback buttons for assistant messages (except welcome)
    const msgIndex = state.messages.indexOf(message);
    if (!isUser && msgIndex > 0) {
      const feedbackClass = message.feedback ? `doral-feedback-given` : '';
      html += `
        <div class="doral-chat-feedback ${feedbackClass}">
          <span class="doral-chat-feedback-label">${labels.feedback}</span>
          <button class="doral-chat-feedback-btn doral-positive ${message.feedback === 'positive' ? 'doral-selected' : ''}"
                  data-feedback="positive" aria-label="Yes, helpful" ${message.feedback ? 'disabled' : ''}>
            ${ICONS.thumbUp}
          </button>
          <button class="doral-chat-feedback-btn doral-negative ${message.feedback === 'negative' ? 'doral-selected' : ''}"
                  data-feedback="negative" aria-label="No, not helpful" ${message.feedback ? 'disabled' : ''}>
            ${ICONS.thumbDown}
          </button>
        </div>
      `;
    }

    html += '</div>';
    messageEl.innerHTML = html;

    // Add feedback click handlers
    messageEl.querySelectorAll('.doral-chat-feedback-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.disabled) return;
        const feedback = this.dataset.feedback;
        handleFeedback(message, feedback);
        // Update UI
        messageEl.querySelectorAll('.doral-chat-feedback-btn').forEach(b => {
          b.classList.remove('doral-selected');
          b.disabled = true;
        });
        this.classList.add('doral-selected');
        messageEl.querySelector('.doral-chat-feedback').classList.add('doral-feedback-given');
      });
    });

    elements.messages.appendChild(messageEl);
  }

  function showLoading() {
    const labels = LABELS[state.language];

    // Set aria-busy on messages container
    elements.messages.setAttribute('aria-busy', 'true');

    const loadingEl = document.createElement('div');
    loadingEl.className = 'doral-chat-message doral-assistant doral-chat-loading-container';
    loadingEl.setAttribute('aria-label', labels.typing);
    loadingEl.innerHTML = `
      <div class="doral-chat-message-avatar">${ICONS.bot}</div>
      <div class="doral-chat-loading-wrapper">
        <div class="doral-chat-loading">
          <div class="doral-chat-loading-dot"></div>
          <div class="doral-chat-loading-dot"></div>
          <div class="doral-chat-loading-dot"></div>
        </div>
        <span class="doral-chat-typing-text">${labels.typing}...</span>
      </div>
    `;
    elements.messages.appendChild(loadingEl);
    scrollToBottom();
  }

  function hideLoading() {
    elements.messages.setAttribute('aria-busy', 'false');
    const loading = elements.messages.querySelector('.doral-chat-loading-container');
    if (loading) loading.remove();
  }

  async function sendMessage() {
    const content = elements.input.value.trim();
    if (!content || state.isLoading) return;

    // Clear input
    elements.input.value = '';
    elements.sendBtn.disabled = true;

    // Add user message
    addMessage('user', content);

    // Show loading
    state.isLoading = true;
    showLoading();

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: state.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          language: state.language,
          sessionId: state.sessionId,
          conversationId: state.conversationId
        })
      });

      const data = await response.json();

      // Update language if detected differently
      if (data.language && data.language !== state.language) {
        state.language = data.language;
        updateLabels();
      }

      // Add assistant response
      addMessage('assistant', data.message || getErrorMessage(), {
        sources: data.sources || [],
        escalate: data.escalate || false
      });

      // Log conversation
      logConversation(data);

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', getErrorMessage());
    } finally {
      state.isLoading = false;
      hideLoading();
      elements.input.focus();
    }
  }

  // ==================== FEEDBACK & LOGGING ====================

  async function handleFeedback(message, feedbackType) {
    // Update message feedback
    message.feedback = feedbackType;
    saveConversation();

    // Find the user query that preceded this response
    const msgIndex = state.messages.indexOf(message);
    const userMessage = msgIndex > 0 ? state.messages[msgIndex - 1] : null;

    try {
      await fetch(CONFIG.feedbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          conversationId: state.conversationId,
          sessionId: state.sessionId,
          rating: feedbackType,
          query: userMessage ? userMessage.content : '',
          response: message.content,
          language: state.language,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to send feedback:', error);
    }
  }

  async function logConversation(responseData) {
    try {
      await fetch(CONFIG.logUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          conversationId: state.conversationId,
          messages: state.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          language: state.language,
          sentiment: responseData.sentiment || 'neutral',
          escalated: responseData.escalate || false,
          pageUrl: window.location.href
        })
      });
    } catch (error) {
      console.warn('Failed to log conversation:', error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  function getErrorMessage() {
    return state.language === 'es'
      ? 'Lo siento, tengo problemas para conectarme. Por favor intente de nuevo.'
      : 'I apologize, but I\'m having trouble connecting. Please try again.';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  // ==================== INITIALIZE ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
