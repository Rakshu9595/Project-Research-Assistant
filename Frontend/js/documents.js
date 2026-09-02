/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — DOCUMENT MANAGEMENT (documents.js)
 * ==========================================================================
 */

let currentDocuments = [];
let documentToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  Auth.initNavUser();

  setupUploadZone();
  setupSearchAndFilters();
  loadDocuments();
});

/**
 * Setup drag-and-drop and file input handlers
 */
function setupUploadZone() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');

  if (!dropZone || !fileInput) return;

  if (browseBtn) {
    browseBtn.addEventListener('click', () => fileInput.click());
  }

  dropZone.addEventListener('click', (e) => {
    if (e.target !== browseBtn && !browseBtn?.contains(e.target)) {
      fileInput.click();
    }
  });

  // Drag over / leave events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-active');
    });
  });

  // Handle drop
  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  // Handle browse selection
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  });
}

/**
 * Validate and upload a single file
 * @param {File} file 
 */
async function handleFileUpload(file) {
  const allowedExtensions = ['pdf', 'docx', 'txt'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  if (!ext || !allowedExtensions.includes(ext)) {
    Utils.showToast('Invalid file format. Please upload PDF, DOCX, or TXT reports.', 'warning');
    return;
  }

  if (file.size > maxSizeBytes) {
    Utils.showToast('File is too large. Maximum supported size is 25 MB.', 'warning');
    return;
  }

  const uploadProgressCard = document.getElementById('uploadProgressCard');
  const uploadFileName = document.getElementById('uploadFileName');
  const uploadFileSize = document.getElementById('uploadFileSize');
  const uploadProgressBar = document.getElementById('uploadProgressBar');
  const uploadStatusText = document.getElementById('uploadStatusText');

  if (uploadProgressCard) {
    uploadProgressCard.classList.remove('d-none');
    if (uploadFileName) uploadFileName.textContent = file.name;
    if (uploadFileSize) uploadFileSize.textContent = Utils.formatFileSize(file.size);
    if (uploadProgressBar) {
      uploadProgressBar.style.width = '40%';
      uploadProgressBar.classList.remove('bg-danger', 'bg-success');
    }
    if (uploadStatusText) uploadStatusText.textContent = 'Uploading to secure storage...';
  }

  const formData = new FormData();
  formData.append('document', file);
  formData.append('filename', file.name);

  try {
    if (uploadProgressBar) uploadProgressBar.style.width = '70%';
    const result = await window.documentAPI.upload(formData);

    if (uploadProgressBar) uploadProgressBar.style.width = '100%';
    if (uploadStatusText) uploadStatusText.textContent = 'Processing & indexing completed!';
    Utils.showToast('Document uploaded successfully!', 'success');

    // Reload document list
    setTimeout(() => {
      if (uploadProgressCard) uploadProgressCard.classList.add('d-none');
      loadDocuments();
    }, 1200);
  } catch (err) {
    if (uploadProgressBar) {
      uploadProgressBar.style.width = '100%';
      uploadProgressBar.classList.add('bg-danger');
    }
    if (uploadStatusText) uploadStatusText.textContent = 'Upload failed.';
    Utils.showToast(err.message || 'Failed to upload document. Please try again.', 'error');
  } finally {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  }
}

/**
 * Load and render documents list
 */
async function loadDocuments() {
  const container = document.getElementById('documentsTableContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading documents...</span>
      </div>
      <p class="text-muted mt-2">Loading documents...</p>
    </div>
  `;

  try {
    const res = await window.documentAPI.getAll();
    currentDocuments = Array.isArray(res) ? res : (res?.documents || []);
    renderDocumentsList(currentDocuments);
  } catch (err) {
    container.innerHTML = Utils.renderErrorState('Unable to fetch documents from server.', 'loadDocuments()');
  }
}

/**
 * Render documents table or empty state
 * @param {Array} docs 
 */
function renderDocumentsList(docs) {
  const container = document.getElementById('documentsTableContainer');
  const countBadge = document.getElementById('documentsCountBadge');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${docs.length} ${docs.length === 1 ? 'Report' : 'Reports'}`;
  }

  if (!docs || docs.length === 0) {
    container.innerHTML = Utils.renderEmptyState(
      'No documents found',
      'Upload your project reports above to begin intelligent research and grounded question answering.',
      'bi-folder2-open'
    );
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Document Name</th>
            <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Type</th>
            <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Size</th>
            <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Status</th>
            <th scope="col" style="font-size: 0.8rem; text-transform: uppercase;">Uploaded Date</th>
            <th scope="col" class="text-end" style="font-size: 0.8rem; text-transform: uppercase;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  docs.forEach(doc => {
    const docId = doc._id || doc.id || '';
    const filename = Utils.escapeHtml(doc.filename || doc.name || 'Untitled Document');
    const ext = (doc.fileType || filename.split('.').pop() || 'file').toUpperCase();
    const size = doc.size ? Utils.formatFileSize(doc.size) : '—';
    const status = (doc.status || 'processed').toLowerCase();
    const date = Utils.formatDate(doc.createdAt || doc.uploadDate || new Date());

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
            <i class="bi ${fileIcon}" style="font-size: 1.4rem;"></i>
            <div>
              <div class="fw-semibold text-truncate" style="max-width: 280px;" title="${filename}">${filename}</div>
            </div>
          </div>
        </td>
        <td><span class="badge bg-light text-dark border">${ext}</span></td>
        <td class="text-muted small">${size}</td>
        <td>${statusBadge}</td>
        <td class="text-muted small">${date}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <a href="chat.html?docId=${docId}" class="btn btn-outline-primary" title="Ask Questions in Chat">
              <i class="bi bi-chat-dots"></i> Chat
            </a>
            <button class="btn btn-outline-secondary" onclick="viewDocumentDetails('${docId}')" title="View Details">
              <i class="bi bi-info-circle"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="confirmDeleteDocument('${docId}', '${filename}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
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
}

/**
 * Setup document search & filter inputs
 */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('docSearchInput');
  const filterSelect = document.getElementById('docFilterSelect');

  const applyFilter = () => {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const filter = (filterSelect?.value || 'all').toLowerCase();

    const filtered = currentDocuments.filter(doc => {
      const name = (doc.filename || doc.name || '').toLowerCase();
      const status = (doc.status || 'processed').toLowerCase();
      const matchesQuery = !query || name.includes(query);
      const matchesFilter = filter === 'all' || status === filter;
      return matchesQuery && matchesFilter;
    });

    renderDocumentsList(filtered);
  };

  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce(applyFilter, 200));
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }
}

/**
 * View document metadata in modal
 * @param {string} id 
 */
function viewDocumentDetails(id) {
  const doc = currentDocuments.find(d => (d._id || d.id) === id);
  if (!doc) return;

  const modalTitle = document.getElementById('docDetailsTitle');
  const modalBody = document.getElementById('docDetailsBody');

  if (modalTitle) modalTitle.textContent = doc.filename || doc.name || 'Document Details';

  if (modalBody) {
    modalBody.innerHTML = `
      <div class="row g-3">
        <div class="col-6">
          <label class="text-muted small">File Name</label>
          <div class="fw-semibold">${Utils.escapeHtml(doc.filename || doc.name || '—')}</div>
        </div>
        <div class="col-6">
          <label class="text-muted small">Format</label>
          <div><span class="badge bg-light text-dark border">${(doc.fileType || 'PDF').toUpperCase()}</span></div>
        </div>
        <div class="col-6">
          <label class="text-muted small">File Size</label>
          <div class="fw-semibold">${doc.size ? Utils.formatFileSize(doc.size) : '—'}</div>
        </div>
        <div class="col-6">
          <label class="text-muted small">Uploaded Date</label>
          <div class="fw-semibold">${Utils.formatDate(doc.createdAt || doc.uploadDate)}</div>
        </div>
        <div class="col-12">
          <label class="text-muted small">RAG Status</label>
          <div><span class="badge-app badge-success"><i class="bi bi-check-circle"></i> Ready for Document-Grounded Q&A</span></div>
        </div>
      </div>
    `;
  }

  const modalEl = document.getElementById('documentDetailsModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

/**
 * Show delete confirmation modal
 * @param {string} id 
 * @param {string} name 
 */
function confirmDeleteDocument(id, name) {
  documentToDeleteId = id;
  const nameEl = document.getElementById('deleteDocName');
  if (nameEl) nameEl.textContent = name;

  const modalEl = document.getElementById('deleteConfirmModal');
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

/**
 * Execute document deletion
 */
async function executeDeleteDocument() {
  if (!documentToDeleteId) return;

  const deleteBtn = document.getElementById('confirmDeleteBtn');
  Utils.setButtonLoading(deleteBtn, true);

  try {
    await window.documentAPI.delete(documentToDeleteId);
    Utils.showToast('Document deleted successfully', 'info');

    // Close modal
    const modalEl = document.getElementById('deleteConfirmModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    loadDocuments();
  } catch (err) {
    Utils.showToast(err.message || 'Failed to delete document', 'error');
  } finally {
    Utils.setButtonLoading(deleteBtn, false, 'Delete Document');
    documentToDeleteId = null;
  }
}

window.viewDocumentDetails = viewDocumentDetails;
window.confirmDeleteDocument = confirmDeleteDocument;
window.executeDeleteDocument = executeDeleteDocument;
