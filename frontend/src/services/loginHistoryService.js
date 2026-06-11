import api from "../api/axios";

export const createLoginHistory = async (loginData) => {
  try {
    console.log("Creating login history entry:", loginData);
    const response = await api.post("/login-history", loginData);
    console.log("Login history created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create login history:", error);
    throw error;
  }
};

export const getMyLoginHistory = async (page = 0, size = 10) => {
  try {
    console.log("Fetching my login history...");
    const response = await api.get(`/login-history/my-logins?page=${page}&size=${size}`);
    console.log("My login history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to get my login history:", error);
    if (error.response?.status === 403) {
      console.warn("User doesn't have permission to access login history endpoints");
      return { content: [], totalPages: 0, totalElements: 0 };
    }
    throw error;
  }
};

export const getAllLoginHistory = async (page = 0, size = 20) => {
  try {
    const response = await api.get(`/login-history/all?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get all login history:", error);
    throw error;
  }
};

export const getRecentLogins = async (days = 7) => {
  try {
    const response = await api.get(`/login-history/recent?days=${days}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get recent logins:", error);
    throw error;
  }
};

export const getUserLoginHistory = async (userId, page = 0, size = 10) => {
  try {
    const response = await api.get(`/login-history/user/${userId}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user login history:", error);
    throw error;
  }
};
