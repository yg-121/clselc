/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import { auth } from "../services/api";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    return token || localStorage.getItem("token") || null;
  };

  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      const storedResponse = JSON.parse(localStorage.getItem("authResponse"));
      setUser(storedResponse.data);
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await auth.login({ email, password });
      localStorage.setItem("authResponse", JSON.stringify(response));
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      
      if (!newToken) throw new Error("No token in response");

      setToken(newToken);
      setUser(response.data);
      setError(null);
      return { success: true, user: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const response = await auth.register(data);
      console.log("register response:", response.data);
      const { token: newToken, user } = response.data;
      if (!newToken) throw new Error("No token in response");
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(user);
      setError(null);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await auth.forgotPassword({ email });
      setError(null);
      return { success: true, message: response.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset email";
      setError(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await auth.resetPassword({ token, newPassword });
      setError(null);
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        getToken,
        setToken,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
