import axios from "axios"
import { getToken } from "./auth.js"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export const chat = {
  sendMessage: async (data) => {
    try {
      const response = await api.post("/chats/send", data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - sendMessage:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send message",
      }
    }
  },

  sendMessageWithFile: async (formData) => {
    try {
      const response = await api.post("/chats/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - sendMessageWithFile:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send message with file",
      }
    }
  },

  getChatHistory: async (userId) => {
    try {
      const response = await api.get(`/chats/history/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - getChatHistory:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get chat history",
      }
    }
  },

  markChatAsRead: async (chatId) => {
    try {
      const response = await api.patch(`/chats/read/${chatId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - markChatAsRead:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to mark chat as read",
      }
    }
  },

  deleteChat: async (chatId) => {
    try {
      const response = await api.delete(`/chats/${chatId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - deleteChat:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete chat",
      }
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await api.post(`/chats/block/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - blockUser:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to block user",
      }
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.post(`/chats/unblock/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - unblockUser:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to unblock user",
      }
    }
  },

  getUserInfo: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("API Error - getUserInfo:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get user info",
      }
    }
  },
}

export default api
