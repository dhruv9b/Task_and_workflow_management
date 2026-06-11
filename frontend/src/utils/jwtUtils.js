// JWT Token Utility Functions

export const decodeJWT = (token) => {
  try {
    // JWT tokens have 3 parts separated by dots
    const base64Url = token.split('.')[1];
    
    // Replace base64url characters and add padding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Pad with '=' to make it a multiple of 4
    const paddedBase64 = base64.padEnd((base64.length + 4) % 4, '=');
    
    // Decode and parse
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
