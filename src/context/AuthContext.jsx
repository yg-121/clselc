import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");
      const storedRole = localStorage.getItem("userRole");

      if (storedToken && storedUserId && storedRole) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          let response;
          if (storedRole === 'Client') {
            response = await api.get('/users/client/profile');
          } else if (storedRole === 'Lawyer') {
            response = await api.get(`/users/lawyers/${storedUserId}`);
          } else if (storedRole === 'Admin') {
            response = await api.get('/users/admin/profile');
          } else {
            throw new Error('Invalid role');
          }
          console.log("User fetch response:", response.data);
          const userData = storedRole === 'Lawyer' ? response.data.lawyer : response.data.user;
          setUser({
            _id: userData._id,
            username: userData.username,
            role: userData.role,
            status: userData.status,
          });
          setToken(storedToken);
        } catch (err) {
          console.error("Auth initialization error:", err.response?.data || err.message);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userRole");
          localStorage.removeItem("authResponse");
          setUser(null);
          setToken(null);
          setError("Failed to initialize session. Please log in again.");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response:", response.data);
      const { _id, username, role, status } = response.data.data.user;
      const receivedToken = response.data.data.token;

      setUser({ _id, username, role, status });
      setToken(receivedToken);
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("userId", _id);
      localStorage.setItem("userRole", role);
      localStorage.setItem("authResponse", JSON.stringify(response.data.data));
      api.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      setError("");

      return { success: true, user: { _id, username, role, status } };
    } catch (err) {
      console.error("Login catch error:", err.response?.data, err.message);
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { _id, username, role, status } = response.data.data.user;
      const receivedToken = response.data.data.token;

      setUser({ _id, username, role, status });
      setToken(receivedToken);
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("userId", _id);
      localStorage.setItem("userRole", role);
      localStorage.setItem("authResponse", JSON.stringify(response.data.data));
      api.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      setError("");

      return { success: true, user: { _id, username, role, status } };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authResponse");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset email";
      setError(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password";
      setError(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        error,
        loading,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};