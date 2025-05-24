"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "../hooks/authHooks.js"
import { useApi } from "../hooks/useApi.js"
import { chat } from "../services/api.js"
import { toast } from "react-hot-toast"

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const { user: authUser } = useAuth()
  const { callApi } = useApi()
  const [loading, setLoading] = useState(false)
  const [chatState, setChatState] = useState({
    selectedUser: null,
    isBlocked: false,
  })
  const [chatHistory, setChatHistory] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!authUser) return

    const fetchRecentChats = async () => {
      try {
        const response = await callApi(chat.getChatHistory, authUser._id)
        if (!response.success || !response.data?.chats) {
          setRecentChats([])
          setUnreadCounts({})
          return
        }

        const uniqueUsers = new Set()
        const unread = {}
        const chats = response.data.chats

        const recent = chats
          .map((chat) => {
            const otherUserId = chat.sender._id === authUser._id ? chat.receiver._id : chat.sender._id
            const otherUser = chat.sender._id === authUser._id ? chat.receiver : chat.sender

            if (chat.receiver._id === authUser._id && !chat.read) {
              unread[otherUserId] = (unread[otherUserId] || 0) + 1
            }

            return {
              _id: chat._id,
              userId: otherUserId,
              username: otherUser.username,
              role: otherUser.role,
              avatar: otherUser.avatar,
              lastMessage: chat.message || (chat.fileName ? `[File: ${chat.fileName}]` : ""),
              timestamp: chat.createdAt,
              receiver: otherUserId,
              members: [authUser._id, otherUserId].sort().join("-"),
            }
          })
          .filter((chat) => {
            if (!uniqueUsers.has(chat.userId)) {
              uniqueUsers.add(chat.userId)
              return true
            }
            return false
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        setRecentChats(recent)
        setUnreadCounts(unread)
      } catch (error) {
        console.error("Fetch recent chats error:", error)
        toast.error("Failed to load recent chats")
        setRecentChats([])
        setUnreadCounts({})
      }
    }

    fetchRecentChats()
  }, [authUser, callApi])

  const value = {
    chatState,
    setChatState,
    chatHistory,
    setChatHistory,
    recentChats,
    setRecentChats,
    unreadCounts,
    setUnreadCounts,
    file,
    setFile,
    loading,
    setLoading,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
