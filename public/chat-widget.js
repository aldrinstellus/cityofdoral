/**
 * City of Doral AI Chat Widget
 * Embeddable floating chat widget with RAG-powered responses
 * Bilingual (English/Spanish) support
 */
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'http://localhost:3000/api/chat',
    defaultLanguage: 'en'
  };

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
      suggestions: [
        '¿Cuál es el horario del ayuntamiento?',
        '¿Cómo solicito un permiso de construcción?',
        '¿Qué eventos hay próximamente?',
        '¿Dónde están los parques?'
      ],
      welcome: '¡Hola! Soy el Asistente Virtual de la Ciudad de Doral. Puedo ayudarle con información sobre servicios municipales, permisos, eventos, parques y más. ¿Cómo puedo asistirle hoy?'
    }
  };

  // SVG Icons
  const ICONS = {
    chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    bot: '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>',
    external: '<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
  };

  // State
  let state = {
    isOpen: false,
    language: CONFIG.defaultLanguage,
    messages: [],
    isLoading: false
  };

  // DOM Elements
  let elements = {};

  // Initialize widget
  function init() {
    createWidget();
    addEventListeners();
    addWelcomeMessage();
  }

  // Create widget DOM
  function createWidget() {
    // FAB Button
    const fab = document.createElement('button');
    fab.className = 'doral-chat-fab';
    fab.setAttribute('aria-label', 'Open chat');
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
    panel.innerHTML = createPanelHTML();
    document.body.appendChild(panel);
    elements.panel = panel;

    // Cache elements
    elements.header = panel.querySelector('.doral-chat-header');
    elements.title = panel.querySelector('.doral-chat-title');
    elements.subtitle = panel.querySelector('.doral-chat-subtitle');
    elements.langBtn = panel.querySelector('.doral-chat-lang-btn');
    elements.closeBtn = panel.querySelector('.doral-chat-close-btn');
    elements.messages = panel.querySelector('.doral-chat-messages');
    elements.suggestions = panel.querySelector('.doral-chat-suggestions');
    elements.suggestionsLabel = panel.querySelector('.doral-chat-suggestions-label');
    elements.suggestionsList = panel.querySelector('.doral-chat-suggestions-list');
    elements.input = panel.querySelector('.doral-chat-input');
    elements.sendBtn = panel.querySelector('.doral-chat-send-btn');
    elements.disclaimer = panel.querySelector('.doral-chat-disclaimer');
  }

  function createPanelHTML() {
    const labels = LABELS[state.language];
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
          <button class="doral-chat-lang-btn" aria-label="Switch language">
            ${ICONS.globe}
            <span>${state.language.toUpperCase()}</span>
          </button>
          <button class="doral-chat-close-btn" aria-label="Close chat">
            ${ICONS.close}
          </button>
        </div>
      </div>
      <div class="doral-chat-messages" aria-live="polite" role="log"></div>
      <div class="doral-chat-suggestions">
        <p class="doral-chat-suggestions-label">${labels.suggested}</p>
        <div class="doral-chat-suggestions-list">
          ${labels.suggestions.map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`).join('')}
        </div>
      </div>
      <div class="doral-chat-input-area">
        <form class="doral-chat-input-form">
          <input type="text" class="doral-chat-input" placeholder="${labels.placeholder}" aria-label="${labels.placeholder}">
          <button type="submit" class="doral-chat-send-btn" aria-label="${labels.send}" disabled>
            ${ICONS.send}
          </button>
        </form>
        <p class="doral-chat-disclaimer">${labels.disclaimer}</p>
      </div>
    `;
  }

  // Add event listeners
  function addEventListeners() {
    // FAB click
    elements.fab.addEventListener('click', toggleChat);

    // Language toggle
    elements.langBtn.addEventListener('click', toggleLanguage);

    // Close button in header
    elements.closeBtn.addEventListener('click', toggleChat);

    // Input handling
    elements.input.addEventListener('input', function() {
      elements.sendBtn.disabled = !this.value.trim();
    });

    // Form submit
    elements.panel.querySelector('.doral-chat-input-form').addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage();
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
      if (e.key === 'Escape' && state.isOpen) {
        toggleChat();
      }
    });
  }

  // Toggle chat open/close
  function toggleChat() {
    state.isOpen = !state.isOpen;
    elements.fab.classList.toggle('doral-chat-open', state.isOpen);
    elements.panel.classList.toggle('doral-chat-visible', state.isOpen);

    if (state.isOpen) {
      elements.input.focus();
    }
  }

  // Toggle language
  function toggleLanguage() {
    state.language = state.language === 'en' ? 'es' : 'en';
    updateLabels();
  }

  // Update UI labels for current language
  function updateLabels() {
    const labels = LABELS[state.language];
    elements.title.textContent = labels.title;
    elements.subtitle.textContent = labels.subtitle;
    elements.langBtn.querySelector('span').textContent = state.language.toUpperCase();
    elements.input.placeholder = labels.placeholder;
    elements.suggestionsLabel.textContent = labels.suggested;
    elements.disclaimer.textContent = labels.disclaimer;

    // Update suggestions
    elements.suggestionsList.innerHTML = labels.suggestions
      .map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`)
      .join('');
  }

  // Add welcome message
  function addWelcomeMessage() {
    const labels = LABELS[state.language];
    addMessage('assistant', labels.welcome);
  }

  // Add message to chat
  function addMessage(role, content, data = {}) {
    const message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      sources: data.sources || [],
      escalate: data.escalate || false,
      feedback: null
    };
    state.messages.push(message);
    renderMessage(message);
    scrollToBottom();

    // Hide suggestions after first user message
    if (role === 'user' && state.messages.filter(m => m.role === 'user').length === 1) {
      elements.suggestions.style.display = 'none';
    }
  }

  // Render a message
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
    if (!isUser && state.messages.indexOf(message) > 0) {
      html += `
        <div class="doral-chat-feedback">
          <span class="doral-chat-feedback-label">${labels.feedback}</span>
          <button class="doral-chat-feedback-btn doral-positive" data-feedback="positive" aria-label="Yes">
            ${ICONS.thumbUp}
          </button>
          <button class="doral-chat-feedback-btn doral-negative" data-feedback="negative" aria-label="No">
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
        const feedback = this.dataset.feedback;
        handleFeedback(message.id, feedback);
        // Update UI
        messageEl.querySelectorAll('.doral-chat-feedback-btn').forEach(b => b.classList.remove('doral-selected'));
        this.classList.add('doral-selected');
      });
    });

    elements.messages.appendChild(messageEl);
  }

  // Show loading indicator
  function showLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'doral-chat-message doral-assistant doral-chat-loading-container';
    loadingEl.innerHTML = `
      <div class="doral-chat-message-avatar">${ICONS.bot}</div>
      <div class="doral-chat-loading">
        <div class="doral-chat-loading-dot"></div>
        <div class="doral-chat-loading-dot"></div>
        <div class="doral-chat-loading-dot"></div>
      </div>
    `;
    elements.messages.appendChild(loadingEl);
    scrollToBottom();
  }

  // Hide loading indicator
  function hideLoading() {
    const loading = elements.messages.querySelector('.doral-chat-loading-container');
    if (loading) loading.remove();
  }

  // Send message to API
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
          language: state.language
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

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', getErrorMessage());
    } finally {
      state.isLoading = false;
      hideLoading();
      elements.input.focus();
    }
  }

  // Handle feedback
  function handleFeedback(messageId, feedback) {
    console.log('Feedback:', { messageId, feedback });
    // TODO: Send to analytics API
  }

  // Get error message in current language
  function getErrorMessage() {
    return state.language === 'es'
      ? 'Lo siento, tengo problemas para conectarme. Por favor intente de nuevo.'
      : 'I apologize, but I\'m having trouble connecting. Please try again.';
  }

  // Utility: Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Utility: Format time
  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Utility: Scroll to bottom
  function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
