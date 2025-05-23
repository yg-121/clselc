import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/authHooks1.jsx"
import { useApi } from "../../hooks/useApi1.jsx"
import { useChat } from "../../context/ChatContext.jsx"
import { chat } from "../../services/api1.js"
import socketService from "../../services/socket1.js"
import { toast } from "react-hot-toast"
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAudio, FaFile } from "react-icons/fa"
import { Button } from "../../components/ui/button.jsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog.jsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.jsx"
import { Badge } from "../../components/ui/badge.jsx"
import { Send, Paperclip, MoreHorizontal, Trash2, Mic, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"


const Messages = () => {
  const { user: authUser, loading: authLoading } = useAuth()
  const { loading, callApi } = useApi()
  const {
    chatState = {},
    setChatState = () => {},
    chatHistory = [],
    setChatHistory = () => {},
    recentChats = [],
    setRecentChats = () => {},
    unreadCounts = {},
    setUnreadCounts = () => {},
    file = null,
    setFile = () => {},
  } = useChat() || {}

  const [message, setMessage] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredChats, setFilteredChats] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Reactions state
  const [reactions, setReactions] = useState({})

  const navigate = useNavigate()
  const { selectedUser, isBlocked } = chatState

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      navigate("/login")
      return
    }

    const socket = socketService.initialize(authUser._id)
    if (socket) {
      socketService.on("new_message", (msg) => {
        console.log("[Messages] New message:", msg)
        setChatHistory((prev) => {
          if (msg.sender._id === selectedUser || msg.receiver._id === selectedUser) {
            return [...prev, msg]
          }
          return prev
        })

        setRecentChats((prev) => {
          const otherUser = msg.sender._id === authUser._id ? msg.receiver : msg.sender
          const updated = [
            {
              _id: msg._id,
              userId: otherUser._id,
              username: otherUser.username,
              role: otherUser.role,
              avatar: otherUser.avatar,
              lastMessage: msg.message || (msg.fileName ? `[File: ${msg.fileName}]` : ""),
              timestamp: msg.createdAt,
              receiver: otherUser._id,
              members: [authUser._id, otherUser._id].sort().join("-"),
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
            return newCounts
          })
          toast.success(`New message from ${msg.sender.username}`)
        }
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
      })

      socketService.on("user_typing", ({ userId, username }) => {
        if (userId !== authUser._id) {
          setTypingUsers((prev) => ({ ...prev, [userId]: { username, timestamp: Date.now() } }))

          // Auto-clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newState = { ...prev }
              delete newState[userId]
              return newState
            })
          }, 3000)
        }
      })
    }

    return () => {
      socketService.off("new_message")
      socketService.off("chat_deleted")
      socketService.off("user_typing")
    }
  }, [authUser, authLoading, navigate, selectedUser, setChatHistory, setRecentChats, setUnreadCounts, chatHistory])

  useEffect(() => {
    if (!selectedUser || !authUser) return

    const fetchChatHistory = async () => {
      try {
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
                return newCounts
              })
            }
          } catch (error) {
            console.error("[Messages] Auto-mark as read error:", error)
          }
        }

        // Check if user is blocked
        if (chat.getUserInfo) {
          try {
            const senderUser = await callApi(() => chat.getUserInfo(authUser._id))
            if (senderUser.success && senderUser.data?.user) {
              setChatState((prev) => ({
                ...prev,
                isBlocked: senderUser.data.user.blockedUsers.includes(selectedUser),
              }))
            }
          } catch (error) {
            console.error("Error checking block status:", error)
          }
        }

        // Scroll to bottom when chat history changes
        scrollToBottom()
      } catch (error) {
        console.error("[Messages] Fetch chat history error:", error)
        toast.error("Failed to load chat history")
        setChatHistory([])
      }
    }

    fetchChatHistory()
  }, [selectedUser, authUser, callApi, setChatHistory, setUnreadCounts, setChatState])

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
    if (!selectedUser || (!message.trim() && !file && !audioBlob)) return
    if (isBlocked) {
      toast.error("Cannot send message to blocked user")
      return
    }

    try {
      let response

      if (audioBlob) {
        const formData = new FormData()
        formData.append("receiver", selectedUser)
        formData.append("file", audioBlob, "voice-message.wav")
        response = await callApi(() => chat.sendMessageWithFile(formData))
        setAudioBlob(null)
      } else if (file) {
        const formData = new FormData()
        formData.append("receiver", selectedUser)
        if (message.trim()) formData.append("message", message)
        formData.append("file", file)
        response = await callApi(() => chat.sendMessageWithFile(formData))
        setFile(null)
      } else {
        response = await callApi(() => chat.sendMessage({ receiver: selectedUser, message }))
      }

      if (!response.success || !response.data?.chat) {
        throw new Error(response.error || "Invalid response: No chat data")
      }

      setChatHistory((prev) => [...prev, response.data.chat])
      setRecentChats((prev) => {
        const otherUser = {
          id: selectedUser,
          name: response.data.chat.receiver.username,
          role: response.data.chat.receiver.role,
        }
        const updated = [
          {
            _id: response.data.chat._id,
            userId: selectedUser,
            username: otherUser.name,
            role: otherUser.role,
            lastMessage:
              response.data.chat.message ||
              (response.data.chat.fileName ? `[File: ${response.data.chat.fileName}]` : ""),
            timestamp: response.data.chat.createdAt,
            receiver: selectedUser,
            members: [authUser._id, selectedUser].sort().join("-"),
          },
          ...prev.filter((chat) => chat.userId !== selectedUser),
        ]
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      })

      setMessage("")
      scrollToBottom()
      toast.success("Message sent")
    } catch (error) {
      console.error("[Messages] Send message error:", error)
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
      console.error("[Messages] Delete chat error:", error)
      toast.error(error.response?.data?.message || "Failed to delete chat")
    }
  }

  const handleBlockToggle = async () => {
    try {
      const response = await callApi(() => (isBlocked ? chat.unblockUser(selectedUser) : chat.blockUser(selectedUser)))
      if (!response.success) {
        throw new Error(response.error || `Failed to ${isBlocked ? "unblock" : "block"} user`)
      }
      setChatState((prev) => ({ ...prev, isBlocked: !isBlocked }))
      toast.success(isBlocked ? "User unblocked" : "User blocked")
    } catch (error) {
      console.error("[Messages] Block toggle error:", error)
      toast.error(error.response?.data?.message || `Failed to ${isBlocked ? "unblock" : "block"} user`)
    }
  }

  const handleReaction = (chatId, emoji) => {
    // In a real app, you would send this to the server
    setReactions((prev) => {
      const chatReactions = prev[chatId] || []
      return {
        ...prev,
        [chatId]: [...chatReactions, { emoji, userId: authUser._id }],
      }
    })
    toast.success(`Reacted with ${emoji}`)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // Show button when scrolled up more than 300px from bottom
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300)
  }

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Start timer
      const startTime = Date.now()
      const timerInterval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      // Store interval ID for cleanup
      mediaRecorderRef.current.timerInterval = timerInterval
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Could not access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      clearInterval(mediaRecorderRef.current.timerInterval)
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Sidebar */}
      <motion.div
        className="w-1/3 md:w-1/4 bg-white shadow-sm rounded-r-2xl"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-2xl">
          Chats
        </h2>

        {/* Search */}
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value.trim()) {
                  const filtered = recentChats.filter(
                    (chat) =>
                      chat.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      chat.lastMessage.toLowerCase().includes(e.target.value.toLowerCase()),
                  )
                  setFilteredChats(filtered)
                } else {
                  setFilteredChats([])
                }
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        {(searchTerm.trim() ? filteredChats : recentChats).length === 0 ? (
          <div className="p-4 text-gray-500">No conversations yet</div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {(searchTerm.trim() ? filteredChats : recentChats).map((chat) => (
              <motion.div
                key={chat.userId}
                className={`p-3 cursor-pointer border-b border-gray-100 transition-all duration-300 ${
                  selectedUser === chat.userId
                    ? "bg-gradient-to-r from-blue-50 to-blue-100"
                    : "hover:bg-gradient-to-r from-blue-50 to-blue-100"
                }`}
                onClick={() => setChatState((prev) => ({ ...prev, selectedUser: chat.userId }))}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {chat.avatar ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${chat.avatar}`}
                          alt={chat.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm font-semibold">
                          {chat.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{chat.username}</p>
                      {unreadCounts[chat.userId] > 0 && (
                        <motion.div
                          className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full px-2 py-1 text-xs inline-block ml-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                        >
                          {unreadCounts[chat.userId]}
                        </motion.div>
                      )}
                      {isBlocked && chat.userId === selectedUser && (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white ml-2">Blocked</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="text-sm text-gray-500 truncate max-w-[150px] mt-1">{chat.lastMessage}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <motion.div
              className="p-4 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {recentChats.find((chat) => chat.userId === selectedUser)?.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${recentChats.find((chat) => chat.userId === selectedUser)?.avatar}`}
                      alt={recentChats.find((chat) => chat.userId === selectedUser)?.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm font-semibold">
                      {(recentChats.find((chat) => chat.userId === selectedUser)?.username || "User")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 relative">
                    {recentChats.find((chat) => chat.userId === selectedUser)?.username || "User"}
                    <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                  </h3>
                  {isBlocked && (
                    <motion.div
                      className="bg-gradient-to-r from-red-500 to-red-400 text-white rounded-full px-2 py-1 text-xs"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                    >
                      Blocked
                    </motion.div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-blue-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBlockToggle}>
                    {isBlocked ? "Unblock User" : "Block User"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Typing Indicator */}
            {typingUsers[selectedUser] && (
              <motion.div
                className="px-4 py-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">{typingUsers[selectedUser].username} is typing</span>
                  <span className="flex">
                    <motion.span
                      className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-1"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0 }}
                    />
                    <motion.span
                      className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-1"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0.2 }}
                    />
                    <motion.span
                      className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0.4 }}
                    />
                  </span>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div
              className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100"
              onScroll={handleScroll}
            >
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No messages yet</p>
              ) : (
                <AnimatePresence>
                  {chatHistory.map((chat) => (
                    <motion.div
                      key={chat._id}
                      className={`flex mb-3 group ${
                        chat.sender._id === authUser._id ? "justify-end" : "justify-start"
                      }`}
                      initial={{ opacity: 0, x: chat.sender._id === authUser._id ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: chat.sender._id === authUser._id ? 50 : -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl relative ${
                          chat.sender._id === authUser._id
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                            : "bg-white text-gray-800 shadow-sm"
                        }`}
                      >
                        {/* Message Tail */}
                        <div
                          className={`absolute bottom-0 w-3 h-3 ${
                            chat.sender._id === authUser._id ? "right-[-6px] bg-blue-500" : "left-[-6px] bg-white"
                          }`}
                          style={{
                            clipPath:
                              chat.sender._id === authUser._id
                                ? "polygon(0 0, 100% 0, 100% 100%)"
                                : "polygon(0 0, 100% 0, 0 100%)",
                          }}
                        />

                        {chat.message && <p>{chat.message}</p>}
                        {chat.fileUrl && (
                          <div className="mt-2">
                            {getFileIcon(chat.fileType)}
                            {chat.fileType?.includes("audio") ? (
                              <audio
                                src={`${import.meta.env.VITE_API_URL}${chat.fileUrl}`}
                                controls
                                className="max-w-full mt-1"
                              />
                            ) : chat.fileType?.includes("image") ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL}${chat.fileUrl}`}
                                alt={chat.fileName}
                                className="max-w-full mt-1 rounded-lg"
                              />
                            ) : (
                              <a
                                href={`${import.meta.env.VITE_API_URL}${chat.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${
                                  chat.sender._id === authUser._id
                                    ? "text-blue-100 hover:underline"
                                    : "text-blue-600 hover:underline"
                                }`}
                              >
                                {chat.fileName}
                              </a>
                            )}
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="mt-1 flex gap-1">
                          {reactions[chat._id]?.map((reaction, idx) => (
                            <span key={idx} className="text-xs">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>

                        <motion.div
                          className="flex items-center justify-between mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p
                            className={`text-xs ${
                              chat.sender._id === authUser._id ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(chat.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          {chat.sender._id === authUser._id && (
                            <p className={`text-xs text-blue-100`}>{chat.read ? "Read" : "Delivered"}</p>
                          )}
                        </motion.div>

                        {/* Reaction Buttons */}
                        <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-full shadow-md p-1 flex space-x-1">
                            <button
                              onClick={() => handleReaction(chat._id, "👍")}
                              className="hover:bg-gray-100 rounded-full p-1"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => handleReaction(chat._id, "❤️")}
                              className="hover:bg-gray-100 rounded-full p-1"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => handleReaction(chat._id, "😂")}
                              className="hover:bg-gray-100 rounded-full p-1"
                            >
                              😂
                            </button>
                          </div>
                        </div>

                        {(chat.sender._id === authUser._id || chat.receiver._id === authUser._id) && (
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Trash2
                              className="absolute top-1 right-1 w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                              onClick={() => {
                                setChatToDelete(chat._id)
                                setDeleteDialogOpen(true)
                              }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />

              {showScrollButton && (
                <motion.button
                  className="fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-2 shadow-lg"
                  onClick={scrollToBottom}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Input Bar */}
            <motion.div
              className="p-3 bg-gray-100 shadow-inner border-t border-gray-200 sticky bottom-0"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {audioBlob ? (
                <div className="flex items-center gap-2">
                  <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Send
                  </Button>
                  <Button onClick={() => setAudioBlob(null)} variant="outline">
                    Cancel
                  </Button>
                </div>
              ) : isRecording ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    />
                    <span>Recording... {recordingTime}s</span>
                  </div>
                  <Button onClick={stopRecording} variant="outline" className="bg-red-50 text-red-500 border-red-200">
                    Stop
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.label className="cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Paperclip className="w-5 h-5 text-gray-500" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png,.mp3,.wav"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isBlocked}
                    />
                  </motion.label>
                  {file && <span className="text-sm text-gray-500 truncate max-w-[100px]">{file.name}</span>}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)

                      // Handle typing indicator
                      if (!isBlocked && selectedUser) {
                        if (!isTyping) {
                          setIsTyping(true)
                          socketService.emit("typing", { receiverId: selectedUser })
                        }

                        // Reset the timeout on each keystroke
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current)
                        }

                        // Set a new timeout
                        typingTimeoutRef.current = setTimeout(() => {
                          setIsTyping(false)
                        }, 2000)
                      }
                    }}
                    placeholder="Type a message..."
                    className={`flex-1 p-2 bg-white rounded-full border ${
                      isBlocked ? "border-red-300 bg-red-50" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:ring-from-blue-500 focus:ring-to-blue-400 transition-all duration-300`}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isBlocked}
                  />
                  {message.trim() || file ? (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={handleSendMessage}
                        disabled={loading || isBlocked}
                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={startRecording}
                        disabled={loading || isBlocked}
                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <p className="text-gray-500">Select a chat to start messaging</p>
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
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
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
