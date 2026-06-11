import { decodeJWT } from './jwtUtils.js';
import { authStorage } from './authStorage.js';

// Check if JWT token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check if token is expired (exp is in seconds since epoch)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if can't decode
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = authStorage.getToken();
  const role = authStorage.getRole();
  
  if (!token || !role) return false;
  
  if (isTokenExpired(token)) {
    // Clear expired token
    authStorage.clearAuth();
    return false;
  }
  
  return true;
};

// Get user info with authentication check
export const getAuthenticatedUserInfo = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const decoded = decodeJWT(authStorage.getToken());
    return {
      email: decoded?.sub || decoded?.email || null,
      role: authStorage.getRole(),
      exp: decoded?.exp,
      iat: decoded?.iat,
    };
  } catch (error) {
    console.error('Error getting authenticated user info:', error);
    // Clear invalid token
    authStorage.clearAuth();
    return null;
  }
};
