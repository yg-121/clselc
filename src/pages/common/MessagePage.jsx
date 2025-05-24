"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/authHooks"
import { useApi } from "../../hooks/useApi"
import { chat } from "../../services/api"
import socketService from "../../services/socket"
import { toast } from "react-hot-toast"
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAudio, FaFile } from "react-icons/fa"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Badge } from "../../components/ui/badge"
import { Send, Paperclip, MoreHorizontal, Trash2 } from "lucide-react"

const Messages = () => {
  const { user: authUser, loading: authLoading } = useAuth()
  const { loading, callApi } = useApi()
  const [selectedUser, setSelectedUser] = useState("")
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const [isBlocked, setIsBlocked] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)
  const [historyFetched, setHistoryFetched] = useState(false)
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  // Fetch recent chats only once on component mount
  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      navigate("/login")
      return
    }

    const fetchRecentChats = async () => {
      try {
        const response = await callApi(() => chat.getChatHistory(authUser._id))
        console.log("[Messages] getChatHistory response:", response.data)
        if (!response.success || !response.data?.chats) {
          setRecentChats([])
          setUnreadCounts({})
          return
        }
        const uniqueUsers = new Set()
        const unread = {}
        const recent = response.data.chats
          .map((chat) => {
            const otherUserId = chat.sender._id === authUser._id ? chat.receiver._id : chat.sender._id
            if (chat.receiver._id === authUser._id && !chat.read) {
              unread[otherUserId] = (unread[otherUserId] || 0) + 1
            }
            return {
              userId: otherUserId,
              username: chat.sender._id === authUser._id ? chat.receiver.username : chat.sender.username,
              role: chat.sender._id === authUser._id ? chat.receiver.role : chat.sender.role,
              lastMessage: chat.message || (chat.fileName ? `[File: ${chat.fileName}]` : ""),
              timestamp: chat.createdAt,
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
        console.log("[Messages] Unread counts:", unread)
        setHistoryFetched(true)
      } catch (err) {
        console.error("[Messages] Fetch recent chats error:", err.response?.data || err.message)
        toast.error("Failed to load recent chats")
        setRecentChats([])
        setUnreadCounts({})
      }
    }

    fetchRecentChats()

    const socket = socketService.initialize(authUser._id)
    if (socket) {
      socketService.on("new_message", (msg) => {
        console.log("[Messages] New message:", msg)
        setChatHistory((prev) => {
          if (msg.sender._id === selectedUser || msg.receiver._id === authUser._id) {
            return [...prev, msg]
          }
          return prev
        })
        setRecentChats((prev) => {
          const otherUser = msg.sender._id === authUser._id ? msg.receiver : msg.sender
          const updated = [
            {
              userId: otherUser._id,
              username: otherUser.username,
              role: otherUser.role,
              lastMessage: msg.message || (msg.fileName ? `[File: ${msg.fileName}]` : ""),
              timestamp: msg.createdAt,
            },
            ...prev.filter((chat) => chat.userId !== otherUser._id),
          ]
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        })
        if (msg.receiver._id === authUser._id && !msg.read && msg.sender._id !== selectedUser) {
          setUnreadCounts((prev) => {
            const newCounts = {
              ...prev,
              [msg.sender._id]: (prev[msg.sender._id] || 0) + 1,
            }
            console.log("[Messages] Updated unread counts:", newCounts)
            return newCounts
          })
        }
        toast.success(`New message from ${msg.sender.username}`)
      })

      socketService.on("chat_deleted", ({ chatId }) => {
        console.log("[Messages] Chat deleted:", chatId)
        setChatHistory((prev) => prev.filter((chat) => chat._id !== chatId))
        setRecentChats((prev) => {
          const chat = chatHistory.find((c) => c._id === chatId)
          if (!chat) return prev
          const otherUserId = chat.sender._id === authUser._id ? chat.receiver._id : chat.sender._id
          const hasOtherChats = chatHistory.some(
            (c) => c._id !== chatId && (c.sender._id === otherUserId || c.receiver._id === otherUserId),
          )
          if (hasOtherChats) return prev
          return prev.filter((c) => c.userId !== otherUserId)
        })
        toast.success("Chat deleted")
      })
    }

    return () => {
      socketService.off("new_message")
      socketService.off("chat_deleted")
    }
  }, [authUser, authLoading, navigate]) // Removed selectedUser and chatHistory from dependencies

  // Fetch chat history only when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !authUser || !historyFetched) return

    const fetchChatHistory = async () => {
      try {
        // Make API call to get full chat history for selected user
        const response = await callApi(() => chat.getChatHistory(authUser._id))
        if (!response.success || !response.data?.chats) {
          setChatHistory([])
          return
        }
        const filteredChats = response.data.chats.filter(
          (chat) => chat.sender._id === selectedUser || chat.receiver._id === selectedUser,
        )
        setChatHistory(filteredChats)

        // Auto-mark unread messages as read
        const unreadChats = filteredChats.filter((chat) => chat.receiver._id === authUser._id && !chat.read)
        for (const chat of unreadChats) {
          try {
            const readResponse = await callApi(() => chat.markChatAsRead(chat._id))
            if (readResponse.success) {
              setChatHistory((prev) => prev.map((c) => (c._id === chat._id ? { ...c, read: true } : c)))
              setUnreadCounts((prev) => {
                const newCount = (prev[selectedUser] || 1) - 1
                const newCounts = { ...prev, [selectedUser]: newCount >= 0 ? newCount : 0 }
                console.log("[Messages] Unread counts after mark as read:", newCounts)
                return newCounts
              })
            }
          } catch (error) {
            console.error("[Messages] Auto-mark as read error:", error.response?.data || error.message)
          }
        }

        // Scroll to top when chat is loaded
        setTimeout(() => {
          const chatContainer = document.querySelector(".messages-container")
          if (chatContainer) {
            chatContainer.scrollTop = 0
          }
        }, 100)
      } catch (error) {
        console.error("[Messages] Fetch chat history error:", error.response?.data || error.message)
        toast.error("Failed to load chat history")
        setChatHistory([])
      }
    }

    fetchChatHistory()
  }, [selectedUser, authUser, historyFetched, callApi])

  // Auto-scroll only when sending new messages
  useEffect(() => {
    // Only scroll to bottom when a new message is added by the current user
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1]
      if (lastMessage && lastMessage.sender._id === authUser._id) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    }
  }, [chatHistory, authUser._id])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit")
      setFile(null)
      return
    }
    setFile(selectedFile)
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="inline mr-2" />
    if (fileType.includes("pdf")) return <FaFilePdf className="inline mr-2" />
    if (fileType.includes("msword") || fileType.includes("wordprocessingml"))
      return <FaFileWord className="inline mr-2" />
    if (fileType.includes("image")) return <FaFileImage className="inline mr-2" />
    if (fileType.includes("audio")) return <FaFileAudio className="inline mr-2" />
    return <FaFile className="inline mr-2" />
  }

  const handleSendMessage = async () => {
    if (!selectedUser || (!message.trim() && !file)) return
    if (isBlocked) {
      toast.error("Cannot send message to blocked user")
      return
    }
    try {
      let response
      if (file) {
        const formData = new FormData()
        formData.append("receiver", selectedUser)
        if (message.trim()) formData.append("message", message)
        formData.append("file", file)
        response = await callApi(() => chat.sendMessageWithFile(formData))
      } else {
        response = await callApi(() => chat.sendMessage({ receiver: selectedUser, message }))
      }
      if (!response.success || !response.data?.chat) {
        throw new Error(response.error || "Invalid response: No chat data")
      }
      console.log("[Messages] Send message response:", response.data)
      setChatHistory((prev) => [...prev, response.data.chat])
      setRecentChats((prev) => {
        const otherUser = {
          id: selectedUser,
          name: response.data.chat.receiver.username,
          role: response.data.chat.receiver.role,
        }
        const updated = [
          {
            userId: selectedUser,
            username: otherUser.name,
            role: otherUser.role,
            lastMessage:
              response.data.chat.message ||
              (response.data.chat.fileName ? `[File: ${response.data.chat.fileName}]` : ""),
            timestamp: response.data.chat.createdAt,
          },
          ...prev.filter((chat) => chat.userId !== selectedUser),
        ]
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      })
      setMessage("")
      setFile(null)
      toast.success("Message sent")
    } catch (error) {
      console.error("[Messages] Send message error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(error.response?.data?.message || error.message || "Failed to send message")
    }
  }

  const handleDeleteChat = async () => {
    if (!chatToDelete) return
    try {
      const response = await callApi(() => chat.deleteChat(chatToDelete))
      if (!response.success) {
        throw new Error(response.error || "Failed to delete chat")
      }
      setDeleteDialogOpen(false)
      setChatToDelete(null)
      toast.success("Chat deleted")
    } catch (error) {
      console.error("[Messages] Delete chat error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(error.response?.data?.message || "Failed to delete chat")
    }
  }

  const handleBlockToggle = async () => {
    try {
      const response = await callApi(() => (isBlocked ? chat.unblockUser(selectedUser) : chat.blockUser(selectedUser)))
      if (!response.success) {
        throw new Error(response.error || `Failed to ${isBlocked ? "unblock" : "block"} user`)
      }
      setIsBlocked(!isBlocked)
      toast.success(isBlocked ? "User unblocked" : "User blocked")
    } catch (error) {
      console.error("[Messages] Block toggle error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(error.response?.data?.message || `Failed to ${isBlocked ? "unblock" : "block"} user`)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 bg-white shadow-lg rounded-r-3xl overflow-hidden border-r border-indigo-100">
        <h2 className="text-xl font-bold p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-t-2xl flex items-center gap-2 sticky top-0 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          Chats
        </h2>
        {recentChats.length === 0 ? (
          <div className="p-4 text-gray-500">No conversations yet</div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {recentChats.map((chat) => (
              <div
                key={chat.userId}
                className={`p-4 cursor-pointer border-b border-gray-100 transition-all duration-300 ${
                  selectedUser === chat.userId
                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 border-l-4 border-l-indigo-500"
                    : "hover:bg-gradient-to-r from-slate-50 to-slate-100 hover:border-l-4 hover:border-l-indigo-200"
                }`}
                onClick={() => setSelectedUser(chat.userId)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {chat.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-semibold text-gray-800 truncate">{chat.username}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-[150px]">{chat.lastMessage}</p>
                    </div>
                    {unreadCounts[chat.userId] > 0 && (
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {unreadCounts[chat.userId]}
                      </div>
                    )}
                    {isBlocked && chat.userId === selectedUser && (
                      <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white">Blocked</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white shadow-md border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-md">
                  {(recentChats.find((chat) => chat.userId === selectedUser)?.username || "User")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    {recentChats.find((chat) => chat.userId === selectedUser)?.username || "User"}
                    {isBlocked && (
                      <div className="ml-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-full px-2 py-0.5 text-xs">
                        Blocked
                      </div>
                    )}
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center">
                    {recentChats.find((chat) => chat.userId === selectedUser)?.role || "User"}
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2"></span>
                    <span className="text-green-500 text-xs ml-1">Online</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-indigo-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBlockToggle}>
                    {isBlocked ? "Unblock User" : "Block User"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white messages-container relative"
              style={{
                scrollBehavior: "smooth",
                overflowAnchor: "none", // Prevents automatic scrolling
              }}
            >
              {/* Scroll to top button */}
              {chatHistory.length > 5 && (
                <button
                  className="absolute top-2 right-2 z-10 bg-indigo-500 text-white rounded-full p-2 shadow-lg"
                  onClick={() => {
                    const chatContainer = document.querySelector(".messages-container")
                    if (chatContainer) chatContainer.scrollTop = 0
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No messages yet</p>
              ) : (
                <>
                  {chatHistory.map((chat) => (
                    <div
                      key={chat._id}
                      className={`flex mb-3 ${chat.sender._id === authUser._id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl relative shadow-md ${
                          chat.sender._id === authUser._id
                            ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                        style={{
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                      >
                        {/* Message Tail */}
                        <div
                          className={`absolute bottom-0 w-3 h-3 ${
                            chat.sender._id === authUser._id
                              ? "right-[-6px] bg-violet-600"
                              : "left-[-6px] bg-white border-l border-b border-gray-200"
                          }`}
                          style={{
                            clipPath:
                              chat.sender._id === authUser._id
                                ? "polygon(0 0, 100% 0, 100% 100%)"
                                : "polygon(0 0, 100% 0, 0 100%)",
                          }}
                        />

                        {chat.message && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{chat.message}</p>
                        )}
                        {chat.fileUrl && (
                          <div className="p-2 bg-white bg-opacity-10 rounded-lg mt-1 mb-1">
                            {getFileIcon(chat.fileType)}
                            <a
                              href={`${import.meta.env.VITE_SOCKET_URL}${chat.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${
                                chat.sender._id === authUser._id
                                  ? "text-indigo-100 hover:underline"
                                  : "text-indigo-600 hover:underline"
                              }`}
                            >
                              {chat.fileName}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p
                            className={`text-xs ${
                              chat.sender._id === authUser._id ? "text-indigo-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(chat.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {(chat.sender._id === authUser._id || chat.receiver._id === authUser._id) && (
                          <Trash2
                            className="absolute top-1 right-1 w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                            onClick={() => {
                              setChatToDelete(chat._id)
                              setDeleteDialogOpen(true)
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white shadow-lg border-t border-gray-200 sticky bottom-0 z-10">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-indigo-100 p-2 rounded-full flex items-center justify-center hover:bg-indigo-200">
                  <Paperclip className="w-5 h-5 text-indigo-500" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png,.mp3,.wav"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isBlocked}
                  />
                </label>
                {file && (
                  <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-full">
                    <span className="text-sm text-indigo-500 truncate max-w-[100px]">{file.name}</span>
                    <button className="text-red-500 hover:text-red-700" onClick={() => setFile(null)}>
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 p-3 bg-gray-50 rounded-full border ${
                    isBlocked ? "border-red-300 bg-red-50" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isBlocked}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || isBlocked}
                  className="p-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-full transition-all duration-300"
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Select a chat to start messaging</p>
            <p className="text-gray-400 text-sm mt-2">Your conversations will appear here</p>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Messages
