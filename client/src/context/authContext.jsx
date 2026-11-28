
import { createContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get currently authenticated user
  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setUser(response.data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);

    setUser(response.data.data.user);

    return response.data;
  };

  // Login user
  const login = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);

    setUser(response.data.data.user);

    return response.data;
  };

  // Logout user
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  // Check authentication on application load
  useEffect(() => {
    getCurrentUser();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
