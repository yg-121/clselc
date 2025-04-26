/* eslint-disable no-unused-vars */


import { createContext, useState, useContext, useEffect } from "react"
import { auth } from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await auth.verify()
          setUser(response.data.user)
        } catch (err) {
          localStorage.removeItem("token")
          setError("Session expired. Please login again.")
        }
      }
      setLoading(false)
    }

    verifyToken()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await auth.login({ email, password })
      localStorage.setItem("token", response.data.token)
      setUser(response.data)
      return { success: true, user: response.data }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed"
      setError(message)
      return { success: false, message }
    }
  }

  const register = async (data) => {
    try {
      const response = await auth.register(data)
      localStorage.setItem("token", response.data.token)
      setUser(response.data)
      return { success: true, user: response.data }
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed"
      setError(message)
      return { success: false, message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await auth.forgotPassword({ email })
      return { success: true, message: response.data.message }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send reset email"
      setError(message)
      return { success: false, message }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await auth.resetPassword({ token, newPassword })
      return { success: true, message: response.data.message }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reset password"
      setError(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
