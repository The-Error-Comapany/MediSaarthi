import React, { createContext, useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 const fetchUser = async () => {
    try {
      const res = await fetchWithAuth(
        "http://localhost:8000/api/v1/users/me"
      );

      if (res.status === 401) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Unexpected error");
      }

      const data = await res.json();
      setUser(data.user || data.data?.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:8000/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        fetchUser, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
