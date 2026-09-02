/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — CORE UTILITIES (utils.js)
 * ==========================================================================
 */

const Utils = {
  /**
   * Escape HTML to prevent XSS vulnerabilities
   * @param {string} str - Raw string
   * @returns {string} Sanitized string
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Format a date into a human readable string (e.g., "Oct 24, 2024")
   * @param {string|Date} dateVal - Input date
   * @returns {string}
   */
  formatDate(dateVal) {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '—';
    }
  },

  /**
   * Format relative time (e.g., "2 hours ago", "Just now")
   * @param {string|Date} dateVal 
   * @returns {string}
   */
  formatRelativeTime(dateVal) {
    if (!dateVal) return 'Just now';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Just now';
      const now = new Date();
      const diffMs = now - d;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return this.formatDate(dateVal);
    } catch (e) {
      return 'Just now';
    }
  },

  /**
   * Format bytes into readable file size (e.g., "2.4 MB")
   * @param {number} bytes 
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /**
   * Toast notification system
   * @param {string} message - Message to display
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Milliseconds before dismiss
   */
  showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('globalToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'globalToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const typeConfig = {
      success: { icon: 'bi-check-circle-fill', color: 'var(--success)', title: 'Success' },
      error: { icon: 'bi-exclamation-triangle-fill', color: 'var(--danger)', title: 'Error' },
      warning: { icon: 'bi-exclamation-circle-fill', color: 'var(--warning)', title: 'Warning' },
      info: { icon: 'bi-info-circle-fill', color: 'var(--primary)', title: 'Notification' }
    };

    const config = typeConfig[type] || typeConfig.info;

    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.innerHTML = `
      <i class="bi ${config.icon}" style="color: ${config.color}; font-size: 1.25rem; flex-shrink: 0; margin-top: 2px;"></i>
      <div style="flex-grow: 1;">
        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); margin-bottom: 2px;">${config.title}</div>
        <div style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.4;">${this.escapeHtml(message)}</div>
      </div>
      <button type="button" style="background:none; border:none; color:var(--text-light); cursor:pointer; padding:0;" aria-label="Close">
        <i class="bi bi-x" style="font-size: 1.2rem;"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  },

  /**
   * Set button loading state
   * @param {HTMLButtonElement} btn 
   * @param {boolean} isLoading 
   * @param {string} originalText 
   */
  setButtonLoading(btn, isLoading, originalText = '') {
    if (!btn) return;
    if (isLoading) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span>Loading...</span>
      `;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalHtml || originalText || 'Submit';
    }
  },

  /**
   * Setup password show/hide toggle for input groups
   */
  setupPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.password-input-group')?.querySelector('input');
        const icon = btn.querySelector('i');
        if (!input) return;

        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
          }
        }
      });
    });
  },

  /**
   * Copy text to clipboard with feedback
   * @param {string} text 
   * @param {HTMLElement} triggerElement 
   */
  async copyToClipboard(text, triggerElement = null) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success', 2000);
      if (triggerElement) {
        const originalTitle = triggerElement.getAttribute('title');
        triggerElement.setAttribute('title', 'Copied!');
        setTimeout(() => {
          if (originalTitle) triggerElement.setAttribute('title', originalTitle);
        }, 2000);
      }
    } catch (err) {
      this.showToast('Failed to copy text', 'error');
    }
  },

  /**
   * Render Empty State HTML
   * @param {string} title 
   * @param {string} description 
   * @param {string} icon 
   * @param {string} actionHtml 
   * @returns {string} HTML string
   */
  renderEmptyState(title, description, icon = 'bi-inbox', actionHtml = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="bi ${icon}"></i>
        </div>
        <h4 class="empty-state-title">${this.escapeHtml(title)}</h4>
        <p class="empty-state-desc">${this.escapeHtml(description)}</p>
        ${actionHtml ? `<div>${actionHtml}</div>` : ''}
      </div>
    `;
  },

  /**
   * Render Error State HTML with retry
   * @param {string} message 
   * @param {string} retryFnName 
   * @returns {string}
   */
  renderErrorState(message, retryFnName = '') {
    return `
      <div class="empty-state" style="border-color: var(--danger-border); background-color: var(--danger-subtle);">
        <div class="empty-state-icon" style="background-color: #fee2e2; color: var(--danger);">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h4 class="empty-state-title" style="color: var(--danger-text);">Unable to load data</h4>
        <p class="empty-state-desc" style="color: var(--danger-text);">${this.escapeHtml(message)}</p>
        ${retryFnName ? `<button class="btn btn-outline-danger btn-sm" onclick="${retryFnName}"><i class="bi bi-arrow-clockwise me-1"></i> Retry</button>` : ''}
      </div>
    `;
  },

  /**
   * Debounce function execution
   * @param {Function} func 
   * @param {number} wait 
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Initialize common UI listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  Utils.setupPasswordToggles();
});
