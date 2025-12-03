// src/config/api.js
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return "https://song-recommendation-system-f5zo.onrender.com";
  }
  return "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
