// Authentication storage utility using localStorage for persistence across tabs

export const authStorage = {
  // Token operations
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  // User object operations
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  removeUser: () => {
    localStorage.removeItem('user');
  },

  // Role operations
  setRole: (role) => {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  },

  getRole: () => {
    return localStorage.getItem('role');
  },

  removeRole: () => {
    localStorage.removeItem('role');
  },

  // Force password change flag
  setForcePasswordChange: (force) => {
    if (force !== undefined) {
      localStorage.setItem('forcePasswordChange', force.toString());
    } else {
      localStorage.removeItem('forcePasswordChange');
    }
  },

  getForcePasswordChange: () => {
    const force = localStorage.getItem('forcePasswordChange');
    return force === 'true';
  },

  removeForcePasswordChange: () => {
    localStorage.removeItem('forcePasswordChange');
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('forcePasswordChange');
    localStorage.removeItem('loginTime');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth header for API calls
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }
};

export default authStorage;
