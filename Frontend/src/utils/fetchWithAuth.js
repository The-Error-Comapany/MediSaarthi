// src/utils/fetchWithAuth.js
export const fetchWithAuth = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include", // ✅ send cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};
