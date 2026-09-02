/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — CHAT INTERFACE LOGIC (chat.js)
 * ==========================================================================
 */

let activeConversationId = null;
let activeDocumentId = null;
let activeDocumentName = null;
let isProcessingMessage = false;

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  Auth.initNavUser();

  parseUrlParams();
  setupChatInputs();
  setupSidebarSearch();
  loadConversations();
});

/**
 * Parse URL parameters for docId or conversation id
 */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const convId = params.get('id');
  const docId = params.get('docId');

  if (convId) {
    activeConversationId = convId;
  }

  if (docId) {
    activeDocumentId = docId;
    renderActiveDocumentPill(docId);
  }
}

/**
 * Render active document badge inside input box
 */
async function renderActiveDocumentPill(docId) {
  const container = document.getElementById('chatDocPillContainer');
  if (!container) return;

  try {
    const doc = await window.documentAPI.getById(docId).catch(() => null);
    activeDocumentName = doc ? (doc.filename || doc.name) : 'Attached Report';

    container.innerHTML = `
      <span class="chat-doc-pill">
        <i class="bi bi-file-earmark-check"></i>
        <span>${Utils.escapeHtml(activeDocumentName)}</span>
        <button type="button" onclick="detachActiveDocument()" title="Detach Document">&times;</button>
      </span>
    `;
  } catch (e) {
    container.innerHTML = '';
  }
}

/**
 * Detach currently attached document
 */
function detachActiveDocument() {
  activeDocumentId = null;
  activeDocumentName = null;
  const container = document.getElementById('chatDocPillContainer');
  if (container) container.innerHTML = '';
  Utils.showToast('Document detached from current chat context', 'info', 2000);
}

/**
 * Setup textarea listeners and send button
 */
function setupChatInputs() {
  const textarea = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendMsgBtn');
  const newChatBtn = document.getElementById('newChatBtn');

  if (textarea) {
    // Auto-resize
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    });

    // Enter to send, Shift+Enter for new line
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => startNewChat());
  }

  // Mobile chat sidebar toggle
  const chatSidebarToggle = document.getElementById('chatSidebarToggle');
  const chatSidebar = document.querySelector('.chat-sidebar');
  if (chatSidebarToggle && chatSidebar) {
    chatSidebarToggle.addEventListener('click', () => {
      chatSidebar.classList.toggle('show');
    });
  }
}

/**
 * Load conversation history in sidebar
 */
async function loadConversations() {
  const listEl = document.getElementById('conversationsList');
  if (!listEl) return;

  try {
    const res = await window.chatAPI.getConversations();
    const convs = Array.isArray(res) ? res : (res?.conversations || []);

    if (!convs || convs.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-chat-square mb-1 d-block" style="font-size: 1.25rem;"></i>
          No chat history yet
        </div>
      `;
      if (!activeConversationId) {
        renderEmptyChatState();
      }
      return;
    }

    let html = '';
    convs.forEach(conv => {
      const convId = conv._id || conv.id || '';
      const title = Utils.escapeHtml(conv.title || 'Research Chat');
      const isActive = convId === activeConversationId;
      const time = Utils.formatRelativeTime(conv.updatedAt || conv.createdAt);

      html += `
        <div class="conversation-item ${isActive ? 'active' : ''}" onclick="selectConversation('${convId}')">
          <div class="conversation-title-wrapper">
            <i class="bi bi-chat-left-dots"></i>
            <div style="min-width: 0;">
              <div class="conversation-title">${title}</div>
              <div class="conversation-time">${time}</div>
            </div>
          </div>
          <button class="conversation-delete-btn" onclick="event.stopPropagation(); deleteConversation('${convId}')" title="Delete conversation">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Load active conversation messages if selected
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      renderEmptyChatState();
    }
  } catch (err) {
    listEl.innerHTML = `<div class="text-danger small p-2">Failed to load history</div>`;
  }
}

/**
 * Filter conversations in sidebar
 */
function setupSidebarSearch() {
  const searchInput = document.getElementById('chatSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.conversation-item').forEach(item => {
      const text = item.querySelector('.conversation-title')?.textContent?.toLowerCase() || '';
      item.style.display = text.includes(query) ? 'flex' : 'none';
    });
  });
}

/**
 * Start a brand new conversation
 */
function startNewChat() {
  activeConversationId = null;
  const url = new URL(window.location.href);
  url.searchParams.delete('id');
  window.history.pushState({}, '', url);

  document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
  renderEmptyChatState();
  
  const textarea = document.getElementById('chatInput');
  if (textarea) textarea.focus();
}

/**
 * Switch active conversation
 * @param {string} id 
 */
function selectConversation(id) {
  activeConversationId = id;
  const url = new URL(window.location.href);
  url.searchParams.set('id', id);
  window.history.pushState({}, '', url);

  document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
  loadConversations();
  loadConversationMessages(id);

  // Close mobile sidebar if open
  document.querySelector('.chat-sidebar')?.classList.remove('show');
}

/**
 * Load conversation details and message history
 * @param {string} id 
 */
async function loadConversationMessages(id) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <span class="ms-2 text-muted small">Loading messages...</span>
    </div>
  `;

  try {
    const res = await window.chatAPI.getConversation(id);
    const messages = res?.messages || (Array.isArray(res) ? res : []);
    
    container.innerHTML = '';

    if (!messages || messages.length === 0) {
      renderEmptyChatState();
      return;
    }

    messages.forEach(msg => {
      renderMessage(msg);
    });

    scrollToBottom();
  } catch (err) {
    container.innerHTML = Utils.renderErrorState('Unable to load conversation messages.', `loadConversationMessages('${id}')`);
  }
}

/**
 * Send user message to AI assistant
 * @param {string} promptText 
 */
async function sendMessage(promptText = null) {
  const textarea = document.getElementById('chatInput');
  const text = promptText || textarea?.value?.trim();

  if (!text || isProcessingMessage) return;

  if (textarea) {
    textarea.value = '';
    textarea.style.height = 'auto';
  }

  isProcessingMessage = true;
  const sendBtn = document.getElementById('sendMsgBtn');
  if (sendBtn) sendBtn.disabled = true;

  // Clear empty state if visible
  const emptyState = document.querySelector('.chat-empty-state');
  if (emptyState) emptyState.remove();

  // 1. Render User message bubble
  renderMessage({
    role: 'user',
    content: text,
    createdAt: new Date()
  });
  scrollToBottom();

  // 2. Show Typing indicator
  showTypingIndicator();

  try {
    const payload = {
      conversationId: activeConversationId,
      question: text,
      message: text,
      documentId: activeDocumentId
    };

    const response = await window.chatAPI.sendMessage(payload);

    hideTypingIndicator();

    if (response) {
      if (response.conversationId && !activeConversationId) {
        activeConversationId = response.conversationId;
        loadConversations();
      }

      // Render Assistant Response
      renderMessage({
        role: 'assistant',
        content: response.answer || response.response || response.message || 'No response generated.',
        mode: response.mode || 'document',
        confidence: response.confidence,
        sources: response.sources || [],
        papers: response.papers || [],
        createdAt: new Date()
      });
      scrollToBottom();
    }
  } catch (err) {
    hideTypingIndicator();
    renderMessage({
      role: 'assistant',
      content: `I encountered an error processing your request: ${err.message || 'Please check your backend connection.'}`,
      mode: 'error',
      createdAt: new Date()
    });
    Utils.showToast(err.message || 'Failed to get response', 'error');
    scrollToBottom();
  } finally {
    isProcessingMessage = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

/**
 * Render single message bubble into chat container
 * @param {object} msg 
 */
function renderMessage(msg) {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  const isUser = msg.role === 'user';
  const row = document.createElement('div');
  row.className = `message-row ${isUser ? 'user' : 'assistant'}`;

  const timeStr = Utils.formatRelativeTime(msg.createdAt || new Date());

  if (isUser) {
    row.innerHTML = `
      <div class="message-avatar">
        <i class="bi bi-person-fill"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <p>${Utils.escapeHtml(msg.content)}</p>
        </div>
        <div class="message-meta">
          <span>${timeStr}</span>
        </div>
      </div>
    `;
  } else {
    // Mode Badge determination
    const mode = (msg.mode || 'document').toLowerCase();
    let modeBadgeHtml = '';
    let disclaimerHtml = '';

    if (mode === 'document' || mode === 'rag') {
      const confPercent = msg.confidence ? Math.round(msg.confidence * 100) : null;
      modeBadgeHtml = `
        <div class="mode-indicator-bar">
          <span class="badge-app badge-rag">
            <i class="bi bi-file-earmark-check-fill"></i> Document Grounded
          </span>
          ${confPercent ? `<span class="confidence-score"><i class="bi bi-shield-check text-success me-1"></i>${confPercent}% match</span>` : ''}
        </div>
      `;
    } else if (mode === 'general_ai' || mode === 'general') {
      modeBadgeHtml = `
        <div class="mode-indicator-bar">
          <span class="badge-app badge-general">
            <i class="bi bi-stars"></i> General AI Answer
          </span>
        </div>
      `;
      disclaimerHtml = `
        <div class="general-ai-note">
          <i class="bi bi-info-circle-fill flex-shrink-0 mt-1"></i>
          <div>This answer was generated from general AI knowledge because relevant information was not found in your uploaded documents.</div>
        </div>
      `;
    } else if (mode === 'research') {
      modeBadgeHtml = `
        <div class="mode-indicator-bar">
          <span class="badge-app badge-research">
            <i class="bi bi-journal-text"></i> Academic Research
          </span>
        </div>
      `;
    }

    // Sources citations rendering
    let sourcesHtml = '';
    if (msg.sources && msg.sources.length > 0) {
      sourcesHtml = `
        <div class="sources-container">
          <div class="sources-header">
            <i class="bi bi-quote"></i> Evidence & Sources
          </div>
          <div class="sources-grid">
      `;

      msg.sources.forEach(source => {
        const fname = Utils.escapeHtml(source.filename || source.docName || 'Report Document');
        const page = source.page ? `Page ${source.page}` : '';
        const section = source.section ? Utils.escapeHtml(source.section) : '';
        const locationStr = [page, section].filter(Boolean).join(' • ') || 'Evidence reference';

        sourcesHtml += `
          <div class="source-card">
            <span class="source-filename" title="${fname}"><i class="bi bi-file-text me-1 text-primary"></i>${fname}</span>
            <span class="source-location">${locationStr}</span>
          </div>
        `;
      });

      sourcesHtml += `
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-avatar">
        <i class="bi bi-cpu"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${modeBadgeHtml}
          <div class="message-text">${formatMessageText(msg.content)}</div>
          ${disclaimerHtml}
          ${sourcesHtml}
        </div>
        <div class="message-meta">
          <span>AI Research Assistant</span>
          <span>•</span>
          <span>${timeStr}</span>
        </div>
      </div>
    `;
  }

  container.appendChild(row);
}

/**
 * Format markdown-like code and paragraphs safely
 * @param {string} text 
 * @returns {string} HTML
 */
function formatMessageText(text) {
  if (!text) return '';
  const escaped = Utils.escapeHtml(text);
  
  // Format linebreaks and paragraphs
  return escaped
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/**
 * Show animated typing indicator
 */
function showTypingIndicator() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  const typingRow = document.createElement('div');
  typingRow.id = 'chatTypingIndicator';
  typingRow.className = 'message-row assistant';
  typingRow.innerHTML = `
    <div class="message-avatar">
      <i class="bi bi-cpu"></i>
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  container.appendChild(typingRow);
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const el = document.getElementById('chatTypingIndicator');
  if (el) el.remove();
}

/**
 * Render initial empty chat state with suggested questions
 */
function renderEmptyChatState() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="chat-empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-chat-dots-fill"></i>
      </div>
      <h3 class="font-display fw-bold mb-2">Ask questions about your project reports</h3>
      <p class="text-muted mb-4">
        Our adaptive assistant checks your uploaded documents first for grounded evidence. If unavailable, it falls back cleanly to general AI knowledge.
      </p>

      <div class="suggestions-grid">
        <div class="suggestion-card" onclick="useSuggestedPrompt('What is the main objective and problem statement of this project?')">
          <i class="bi bi-flag"></i>
          <div>
            <p>What is the main objective of this project?</p>
          </div>
        </div>

        <div class="suggestion-card" onclick="useSuggestedPrompt('Explain the methodology and architecture used in the uploaded reports.')">
          <i class="bi bi-diagram-3"></i>
          <div>
            <p>Explain the methodology & architecture.</p>
          </div>
        </div>

        <div class="suggestion-card" onclick="useSuggestedPrompt('Summarize key findings, experimental results, and conclusion.')">
          <i class="bi bi-bar-chart"></i>
          <div>
            <p>Summarize key findings & results.</p>
          </div>
        </div>

        <div class="suggestion-card" onclick="useSuggestedPrompt('What are the limitations and suggested future work mentioned in the report?')">
          <i class="bi bi-compass"></i>
          <div>
            <p>What are the limitations & future work?</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Populate input with suggested prompt and send
 * @param {string} prompt 
 */
function useSuggestedPrompt(prompt) {
  const textarea = document.getElementById('chatInput');
  if (textarea) {
    textarea.value = prompt;
  }
  sendMessage(prompt);
}

/**
 * Delete a conversation
 * @param {string} id 
 */
async function deleteConversation(id) {
  if (!confirm('Are you sure you want to delete this conversation?')) return;

  try {
    await window.chatAPI.deleteConversation(id);
    Utils.showToast('Conversation deleted', 'info');

    if (activeConversationId === id) {
      startNewChat();
    }
    loadConversations();
  } catch (err) {
    Utils.showToast('Failed to delete conversation', 'error');
  }
}

/**
 * Scroll messages container to the bottom
 */
function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

window.selectConversation = selectConversation;
window.deleteConversation = deleteConversation;
window.useSuggestedPrompt = useSuggestedPrompt;
window.detachActiveDocument = detachActiveDocument;
