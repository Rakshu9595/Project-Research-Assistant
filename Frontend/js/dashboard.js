/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — DASHBOARD LOGIC (dashboard.js)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce authentication
  Auth.requireAuth();
  Auth.initNavUser();

  // Load dashboard components
  loadDashboardData();
});

/**
 * Fetch and populate all dashboard widgets
 */
async function loadDashboardData() {
  try {
    await Promise.allSettled([
      fetchStats(),
      fetchRecentDocuments(),
      fetchRecentConversations()
    ]);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
}

/**
 * Fetch statistics overview
 */
async function fetchStats() {
  const statDocsEl = document.getElementById('statTotalDocs');
  const statProcessedEl = document.getElementById('statProcessedDocs');
  const statChatsEl = document.getElementById('statTotalChats');
  const statPapersEl = document.getElementById('statTotalPapers');

  try {
    // Attempt stats endpoint first, or calculate from documents/conversations
    let stats = null;
    try {
      stats = await window.statsAPI.getDashboardStats();
    } catch (e) {
      // Fallback: fetch list counts directly if dedicated stats endpoint not yet online
      const [docs, convs] = await Promise.all([
        window.documentAPI.getAll().catch(() => []),
        window.chatAPI.getConversations().catch(() => [])
      ]);
      const docsArr = Array.isArray(docs) ? docs : (docs?.documents || []);
      const convsArr = Array.isArray(convs) ? convs : (convs?.conversations || []);

      stats = {
        totalDocs: docsArr.length,
        processedDocs: docsArr.filter(d => (d.status || '').toLowerCase() === 'processed' || d.processed).length,
        totalConversations: convsArr.length,
        totalPapers: 0
      };
    }

    if (statDocsEl) statDocsEl.textContent = stats.totalDocs ?? 0;
    if (statProcessedEl) statProcessedEl.textContent = stats.processedDocs ?? 0;
    if (statChatsEl) statChatsEl.textContent = stats.totalConversations ?? 0;
    if (statPapersEl) statPapersEl.textContent = stats.totalPapers ?? 0;
  } catch (err) {
    if (statDocsEl) statDocsEl.textContent = '0';
    if (statProcessedEl) statProcessedEl.textContent = '0';
    if (statChatsEl) statChatsEl.textContent = '0';
    if (statPapersEl) statPapersEl.textContent = '0';
  }
}

/**
 * Fetch and render recent documents table
 */
async function fetchRecentDocuments() {
  const container = document.getElementById('recentDocsContainer');
  if (!container) return;

  try {
    const res = await window.documentAPI.getAll();
    const docs = Array.isArray(res) ? res : (res?.documents || []);

    if (!docs || docs.length === 0) {
      container.innerHTML = Utils.renderEmptyState(
        'No documents uploaded yet',
        'Upload your PDF, DOCX, or TXT project reports to start receiving grounded answers.',
        'bi-file-earmark-arrow-up',
        '<a href="documents.html" class="btn btn-primary btn-sm"><i class="bi bi-cloud-upload me-1"></i> Upload Document</a>'
      );
      return;
    }

    // Sort by recent and take top 5
    const recent = docs.slice(0, 5);

    let html = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Document</th>
              <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Type</th>
              <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Status</th>
              <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Uploaded</th>
              <th scope="col" class="text-end" style="font-size: 0.8rem; text-transform: uppercase;">Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    recent.forEach(doc => {
      const filename = Utils.escapeHtml(doc.filename || doc.name || 'Untitled Document');
      const ext = (doc.fileType || filename.split('.').pop() || 'file').toUpperCase();
      const status = (doc.status || 'processed').toLowerCase();
      const date = Utils.formatRelativeTime(doc.createdAt || doc.uploadDate || new Date());
      const docId = doc._id || doc.id || '';

      let statusBadge = `<span class="badge-app badge-success"><i class="bi bi-check2-circle"></i> Ready</span>`;
      if (status === 'processing') {
        statusBadge = `<span class="badge-app badge-warning"><i class="bi bi-arrow-repeat spin"></i> Processing</span>`;
      } else if (status === 'failed') {
        statusBadge = `<span class="badge-app badge-danger"><i class="bi bi-x-circle"></i> Failed</span>`;
      }

      let fileIcon = 'bi-file-earmark-text text-primary';
      if (ext === 'PDF') fileIcon = 'bi-file-earmark-pdf text-danger';
      else if (ext === 'DOCX' || ext === 'DOC') fileIcon = 'bi-file-earmark-word text-info';

      html += `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${fileIcon}" style="font-size: 1.35rem;"></i>
              <span class="fw-semibold text-truncate" style="max-width: 260px;" title="${filename}">${filename}</span>
            </div>
          </td>
          <td><span class="badge bg-light text-dark border">${ext}</span></td>
          <td>${statusBadge}</td>
          <td class="text-muted small">${date}</td>
          <td class="text-end">
            <a href="chat.html?docId=${docId}" class="btn btn-outline-primary btn-sm py-1 px-2" title="Ask in Chat">
              <i class="bi bi-chat-dots"></i> Chat
            </a>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = Utils.renderErrorState('Could not load recent documents.', 'fetchRecentDocuments()');
  }
}

/**
 * Fetch and render recent conversations list
 */
async function fetchRecentConversations() {
  const container = document.getElementById('recentConversationsContainer');
  if (!container) return;

  try {
    const res = await window.chatAPI.getConversations();
    const convs = Array.isArray(res) ? res : (res?.conversations || []);

    if (!convs || convs.length === 0) {
      container.innerHTML = Utils.renderEmptyState(
        'No conversations yet',
        'Ask questions grounded in your project reports to see your research threads here.',
        'bi-chat-square-dots',
        '<a href="chat.html" class="btn btn-outline-primary btn-sm"><i class="bi bi-plus-lg me-1"></i> Start New Chat</a>'
      );
      return;
    }

    const recent = convs.slice(0, 5);
    let html = '<div class="d-flex flex-column gap-2">';

    recent.forEach(conv => {
      const title = Utils.escapeHtml(conv.title || 'Research Conversation');
      const date = Utils.formatRelativeTime(conv.updatedAt || conv.createdAt || new Date());
      const convId = conv._id || conv.id || '';

      html += `
        <div class="activity-item">
          <div class="activity-info">
            <div class="activity-icon">
              <i class="bi bi-chat-left-text"></i>
            </div>
            <div>
              <h6 class="activity-title">${title}</h6>
              <p class="activity-meta"><i class="bi bi-clock me-1"></i> ${date}</p>
            </div>
          </div>
          <a href="chat.html?id=${convId}" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = Utils.renderErrorState('Could not load conversations.', 'fetchRecentConversations()');
  }
}
