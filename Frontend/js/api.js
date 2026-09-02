const API_BASE_URL = window.API_BASE_URL || localStorage.getItem('ra_api_url') || 'http://localhost:5000/api';

class ApiClient {
  /**
   * Core request dispatcher with authentication and error handling
   * @param {string} endpoint - API path (e.g. '/documents')
   * @param {object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<any>}
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      ...options.headers
    };

    // Inject JWT Token if available
    const token = localStorage.getItem('ra_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Set JSON content-type if not multipart/FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized (Expired or Invalid token)
      if (response.status === 401) {
        console.warn('Unauthorized request - clearing token');
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html') && !currentPath.includes('index.html')) {
          localStorage.removeItem('ra_token');
          localStorage.removeItem('ra_user');
          window.location.href = 'login.html';
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = (data && (data.message || data.error)) || `API Error: ${response.status} ${response.statusText}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Log for developer debugging
      console.error(`API Request Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  /* Convenience HTTP Methods */
  static get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

/* ==========================================================================
   MODULAR API SERVICES
   ========================================================================== */

/**
 * Authentication Endpoints
 */
const authAPI = {
  register: (data) => ApiClient.post('/auth/register', data),
  login: (data) => ApiClient.post('/auth/login', data),
  getMe: () => ApiClient.get('/auth/me')
};

/**
 * Document Management Endpoints
 */
const documentAPI = {
  getAll: () => ApiClient.get('/documents'),
  getById: (id) => ApiClient.get(`/documents/${id}`),
  upload: (formData) => ApiClient.post('/documents/upload', formData),
  delete: (id) => ApiClient.delete(`/documents/${id}`)
};

/**
 * AI Chat & Conversations Endpoints
 */
const chatAPI = {
  getConversations: () => ApiClient.get('/conversations'),
  getConversation: (id) => ApiClient.get(`/conversations/${id}`),
  createConversation: (title) => ApiClient.post('/conversations', { title }),
  sendMessage: (payload) => ApiClient.post('/chat', payload),
  deleteConversation: (id) => ApiClient.delete(`/conversations/${id}`)
};

/**
 * Academic Research Discovery Endpoints
 */
const researchAPI = {
  search: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return ApiClient.get(`/research/search?${params.toString()}`);
  },
  getProjectResearch: (documentId = null) => {
    const endpoint = documentId ? `/research/project?documentId=${documentId}` : '/research/project';
    return ApiClient.get(endpoint);
  }
};

/**
 * Dashboard & Analytics Endpoints
 */
const statsAPI = {
  getDashboardStats: () => ApiClient.get('/stats/dashboard')
};

// Export to window
window.ApiClient = ApiClient;
window.authAPI = authAPI;
window.documentAPI = documentAPI;
window.chatAPI = chatAPI;
window.researchAPI = researchAPI;
window.statsAPI = statsAPI;
