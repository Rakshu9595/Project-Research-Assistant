/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — AUTHENTICATION MANAGER (auth.js)
 * ==========================================================================
 */

const Auth = {
  TOKEN_KEY: 'ra_token',
  USER_KEY: 'ra_user',

  /**
   * Get JWT token from storage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Get stored user profile
   * @returns {object|null}
   */
  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Save session data to local storage
   * @param {string} token 
   * @param {object} user 
   */
  setSession(token, user) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  /**
   * Perform user login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  async login(email, password) {
    const response = await window.authAPI.login({ email, password });
    if (response) {
      const token = response.token || response.accessToken || response.jwt;
      const user = response.user || { email, name: response.name || email.split('@')[0] };
      if (token) {
        this.setSession(token, user);
      }
      return { token, user };
    }
    throw new Error('Invalid response from server');
  },

  /**
   * Perform user registration
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  async register(name, email, password) {
    return await window.authAPI.register({ name, email, password });
  },

  /**
   * Logout user and redirect to login page
   */
  logout() {
    this.clearSession();
    if (window.Utils) {
      window.Utils.showToast('Logged out successfully', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 400);
  },

  /**
   * Guard for protected pages (redirect to login.html if not authenticated)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  },

  /**
   * Guard for guest pages (redirect to dashboard.html if already logged in)
   */
  requireGuest() {
    if (this.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  },

  /**
   * Initialize User Information and Sidebar/Topbar state on page load
   */
  initNavUser() {
    const user = this.getUser();
    const displayName = user ? (user.name || user.email.split('@')[0]) : 'Researcher';
    const displayEmail = user ? user.email : '';
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RA';

    // Populate user elements across topbar and sidebar
    document.querySelectorAll('.user-name-display').forEach(el => {
      el.textContent = displayName;
    });

    document.querySelectorAll('.user-email-display').forEach(el => {
      el.textContent = displayEmail;
    });

    document.querySelectorAll('.user-avatar-display').forEach(el => {
      el.textContent = initials;
    });

    // Attach logout handlers
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    });

    // Sidebar Mobile Toggle
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        if (backdrop) backdrop.classList.toggle('show');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      });
    }
  }
};

window.Auth = Auth;
