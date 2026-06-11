import api from "../api/axios";
import { authStorage } from "../utils/authStorage";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to login:", error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    throw error;
  }
};

// Store authentication data in localStorage
export const storeAuthData = (token, user) => {
  authStorage.setToken(token);
  authStorage.setUser(user);
  authStorage.setRole(user.role);
  
  // Store force password change flag if present
  if (user.forcePasswordChange !== undefined) {
    authStorage.setForcePasswordChange(user.forcePasswordChange);
  }
};

// Clear authentication data from localStorage
export const clearAuthData = () => {
  authStorage.clearAuth();
};
