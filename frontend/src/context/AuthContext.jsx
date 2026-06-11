import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import ToastNotification from '../components/ToastNotification';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Start with loading true to prevent flash
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.SESSION_EXPIRED:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.type === AUTH_ACTIONS.SESSION_EXPIRED ? 'Session expired. Please login again.' : null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    default:
      return state;
  }
};

// Storage utilities - simple JWT-based auth
const authStorage = {
  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('forcePasswordChange');
    localStorage.removeItem('loginTime');
  },

  // Check if user is logged in
  isUserLoggedIn: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return false;
    }
    
    try {
      const user = JSON.parse(userStr);
      return { valid: true, user, token };
    } catch (error) {
      localStorage.removeItem('user'); // Clear corrupted data
      return false;
    }
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token || token.length < 10) {
      return true;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        return true;
      }
      
      return false;
    } catch (error) {
      return true; // Assume expired if parsing fails
    }
  },

  // Store auth data
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    if (user.forcePasswordChange !== undefined) {
      localStorage.setItem('forcePasswordChange', user.forcePasswordChange.toString());
    }
  },

  // Get token
  getToken: () => localStorage.getItem('token'),

  // Get user
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Check if token is expired - but only if it's been more than 1 minute since login
          // This prevents immediate expiration check right after login
          const loginTime = localStorage.getItem('loginTime');
          const now = Date.now();
          const isRecentLogin = loginTime && (now - parseInt(loginTime)) < 60000; // 1 minute grace period
          
          if (!isRecentLogin && authStorage.isTokenExpired(token)) {
            authStorage.clearAuth();
            dispatch({ type: AUTH_ACTIONS.SESSION_EXPIRED });
            return;
          }
          
          // Restore authentication state
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { token, user },
          });
          
        } catch (error) {
          authStorage.clearAuth();
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Listen for storage events to sync logout across tabs
  useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'logout-event') {
      // ❌ DO NOT clear localStorage here
      // Only update React state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      showToast('Session ended in another tab', 'info');
      navigate('/');
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [navigate]);

  // Login function - removes existing token for new user
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Clear any existing auth data before attempting login to prevent conflicts
      const existingToken = localStorage.getItem("token");
      const existingUser = localStorage.getItem("user");
      
      if (existingToken || existingUser) {
        // Notify other tabs about logout
        if (existingToken && existingUser) {
          localStorage.setItem("logout-event", Date.now());
        }
        
        // Clear auth data
        authStorage.clearAuth();
      }

      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      // Check if user is active
      if (userData.active === false) {
        throw new Error('User deactivated');
      }

      // Set new auth data
      authStorage.setAuth(token, userData);
      
      // Store login time to prevent immediate expiration check
      localStorage.setItem('loginTime', Date.now().toString());
  
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user: userData },
      });

      showToast(`Successfully logged in as ${email}`, 'success');

      // Navigate based on role
      switch (userData.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'MANAGER':
          navigate('/manager');
          break;
        case 'EMPLOYEE':
          navigate('/employees');
          break;
        default:
          navigate('/');
      }

      return { success: true, user: userData };
    } catch (error) {
      // Handle different error response structures
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        // Backend returns: { code, error, message, status }
        const errorData = error.response.data;
        errorMessage = errorData.message || errorData.error || errorData.code || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    // Clear auth data
    authStorage.clearAuth();
localStorage.setItem("logout-event", Date.now());
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  // Handle session expired
  const handleSessionExpired = () => {
    authStorage.clearAuth();
    dispatch({ type: AUTH_ACTIONS.SESSION_EXPIRED });
    showToast('Session expired, please login again', 'warning');
    navigate('/');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if force password change
  const checkForcePasswordChange = () => {
    return localStorage.getItem('forcePasswordChange') === 'true';
  };

  // Update force password change
  const updateForcePasswordChange = (value) => {
    localStorage.setItem('forcePasswordChange', value.toString());
  };

  const value = {
    ...state,
    login,
    logout,
    handleSessionExpired,
    clearError,
    checkForcePasswordChange,
    updateForcePasswordChange,
    getToken: authStorage.getToken,
    getCurrentUser: authStorage.getUser,
    isUserLoggedIn: authStorage.isUserLoggedIn,
    isTokenExpired: authStorage.isTokenExpired,
    showToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
