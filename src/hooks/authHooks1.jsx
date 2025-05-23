"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import api from "../services/api1.js"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setLoading(false)
          return
        }

        const response = await api.get("/auth/me")
        if (response.data && response.data.user) {
          setUser(response.data.user)
        }
      } catch (err) {
        console.error("Auth check error:", err)
        localStorage.removeItem("token")
        setError("Authentication failed. Please login again.")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await api.post("/auth/login", credentials)
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token)
        setUser(response.data.user)
        return { success: true }
      }
      return { success: false, message: "Login failed" }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return React.createElement(AuthContext.Provider, { value: { user, loading, error, login, logout } }, children)
}

export const useAuth = () => useContext(AuthContext)
