import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, User, Check, CheckCheck, Search, Paperclip, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

const API_URL = "http://localhost:5000";
let socket;

export default function MessagesPage() {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Get user info from token
    const getUserInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.user.role);
        setUserId(response.data.user.id);
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigate("/login");
      }
    };

    getUserInfo();

    // Connect to socket
    socket = io(API_URL, {
      query: { token }
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("new_message", (message) => {
      handleNewMessage(message);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [navigate]);

  // Fetch conversations (lawyers or clients depending on user role)
  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Get all users the current user has chatted with
        const response = await axios.get(`${API_URL}/api/chats/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get unique users from chat history
        const uniqueUsers = new Set();
        const unreadChats = response.data.unreadChats || [];
        
        // Create conversation objects
        const conversationsData = [];
        
        // Add unread conversations
        for (const chat of unreadChats) {
          const otherUser = chat.sender;
          if (!uniqueUsers.has(otherUser._id)) {
            uniqueUsers.add(otherUser._id);
            conversationsData.push({
              id: otherUser._id,
              contactName: otherUser.username,
              contactRole: otherUser.role.toLowerCase(),
              lastMessage: chat.message || (chat.file ? "Sent a file" : ""),
              lastMessageTime: new Date(chat.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              unreadCount: 1, // We'll count these properly later
              online: false, // We could implement this with socket.io
              userId: otherUser._id
            });
          }
        }
        
        setConversations(conversationsData);
        
        // If conversationId is provided, select that conversation
        if (conversationId) {
          const conversation = conversationsData.find(c => c.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
            fetchChatHistory(conversation.userId);
          }
        } else if (conversationsData.length > 0) {
          setSelectedConversation(conversationsData[0]);
          fetchChatHistory(conversationsData[0].userId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
        toast.error("Failed to load conversations");
      }
    };

    fetchConversations();
  }, [userId, conversationId]);

  // Fetch chat history when a conversation is selected
  const fetchChatHistory = async (userId) => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/chats/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const chatHistory = response.data.chats || [];
      
      // Get user details
      const userResponse = await axios.get(`${API_URL}/api/users/lawyers/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedUser(userResponse.data.lawyer);
      
      // Update the selected conversation with messages
      setSelectedConversation(prev => ({
        ...prev,
        messages: chatHistory.map(chat => ({
          id: chat._id,
          content: chat.message,
          timestamp: new Date(chat.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          sender: chat.sender._id === userId ? "contact" : "user",
          status: chat.read ? "read" : "delivered",
          file: chat.file,
          filePath: chat.filePath
        }))
      }));
      
      // Mark messages as read
      if (chatHistory.some(chat => !chat.read && chat.sender._id === userId)) {
        markChatAsRead(userId);
      }
      
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Failed to load chat history");
    }
  };

  // Mark chat as read
  const markChatAsRead = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/api/chats/${chatId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  // Handle new incoming message
  const handleNewMessage = (message) => {
    // Check if the message is from the currently selected conversation
    if (selectedConversation && message.sender === selectedConversation.userId) {
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), {
          id: message._id,
          content: message.message,
          timestamp: new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          sender: "contact",
          status: "delivered",
          file: message.file,
          filePath: message.filePath
        }]
      }));
      
      // Mark as read since we're viewing it
      markChatAsRead(message._id);
    } else {
      // Update the conversations list with the new message
      setConversations(prev => {
        const existingConversation = prev.find(c => c.userId === message.sender);
        
        if (existingConversation) {
          return prev.map(c => 
            c.userId === message.sender 
              ? {
                  ...c,
                  lastMessage: message.message || "New message",
                  lastMessageTime: new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  unreadCount: c.unreadCount + 1
                }
              : c
          );
        } else {
          // This is a new conversation
          return [{
            id: message.sender,
            contactName: message.senderName || "User",
            contactRole: "unknown",
            lastMessage: message.message || "New message",
            lastMessageTime: new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            unreadCount: 1,
            online: false,
            userId: message.sender
          }, ...prev];
        }
      });
      
      // Show notification
      toast.success(`New message from ${message.senderName || "User"}`);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedConversation || sending) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("receiver", selectedConversation.userId);
      
      if (newMessage.trim()) {
        formData.append("message", newMessage.trim());
      }
      
      if (file) {
        formData.append("file", file);
      }
      
      const response = await axios.post(`${API_URL}/api/chats/send`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      // Add the sent message to the conversation
      const sentMessage = {
        id: response.data.chat?._id || Date.now(),
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        sender: "user",
        status: "sent",
        file: file ? "file" : null,
        filePath: response.data.chat?.filePath
      };
      
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), sentMessage],
        lastMessage: newMessage || "Sent a file",
        lastMessageTime: "Just now"
      }));
      
      // Update conversations list
      setConversations(prev => 
        prev.map(c => 
          c.id === selectedConversation.id 
            ? {
                ...c,
                lastMessage: newMessage || "Sent a file",
                lastMessageTime: "Just now"
              }
            : c
        )
      );
      
      setNewMessage("");
      setFile(null);
      setSending(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setSending(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    
    if (timestamp.includes("Yesterday") || timestamp.includes("Today")) {
      return timestamp;
    }
    
    // Check if it's today
    const messageDate = new Date(timestamp);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return timestamp;
    }
    
    // Check if it's yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timestamp}`;
    }
    
    // Otherwise return the date and time
    return messageDate.toLocaleDateString() + ", " + timestamp;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
        return <Check className="h-3 w-3" />;
      case "read":
        return <CheckCheck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Start a new chat (for clients)
  const startNewChat = async (lawyerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/chats/start`, { lawyerId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Navigate to the chat with this lawyer
      navigate(`/client/messages/${lawyerId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    }
  };

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {/* Sidebar - Conversations List */}
            <div className="md:col-span-1 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100vh-13rem)]">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No conversations yet</p>
                    {userRole === "Client" && (
                      <button
                        onClick={() => navigate("/client/lawyer")}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                      >
                        Find a Lawyer
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? "bg-gray-100"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchChatHistory(conversation.userId);
                        if (conversation.unreadCount > 0) {
                          markChatAsRead(conversation.userId);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {conversation.contactName.charAt(0).toUpperCase()}
                          </div>
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-900">
                              {conversation.contactName}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessageTime}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-2 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col h-[calc(100vh-10rem)]">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center">
                    <button 
                      className="md:hidden mr-2"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {selectedConversation.contactName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedConversation.contactName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.contactRole.charAt(0).toUpperCase() + 
                         selectedConversation.contactRole.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                      selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex mb-4 ${
                            message.sender === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message
