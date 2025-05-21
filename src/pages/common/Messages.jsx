import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authHooks.js";
import api from "../../services/api.js";
import socketService from "../../services/socket.js";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { FiSend, FiPaperclip, FiTrash2, FiLock, FiUnlock, FiX, FiArrowLeft } from "react-icons/fi";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authLoading && (!user || !token)) {
      toast.error("Please log in to view messages");
      navigate("/login");
    }
  }, [user, token, authLoading, navigate]);

  useEffect(() => {
    if (!user || !token || authLoading) return;

    socketRef.current = socketService.getSocket();
    if (!socketRef.current) {
      socketService.initialize(user._id);
      socketRef.current = socketService.getSocket();
    }

    fetchChats();

    socketRef.current.on("newChat", (chat) => {
      fetchChats();
    });

    socketRef.current.on("new_message", (message) => {
      if (message.sender._id === selectedChat?.userId || message.receiver._id === selectedChat?.userId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchChats();
    });

    socketRef.current.on("new_notification", (notification) => {
      toast(notification.message);
    });

    socketRef.current.on("chatDeleted", (chatId) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
        setIsChatOpen(false);
      }
    });

    socketRef.current.on("userBlocked", ({ userId }) => {
      setBlockedUsers((prev) => [...new Set([...prev, userId])]);
      toast("User blocked");
    });

    socketRef.current.on("userUnblocked", ({ userId }) => {
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
      toast("User unblocked");
    });

    return () => {
      socketRef.current?.off("newChat");
      socketRef.current?.off("new_message");
      socketRef.current?.off("new_notification");
      socketRef.current?.off("chatDeleted");
      socketRef.current?.off("userBlocked");
      socketRef.current?.off("userUnblocked");
    };
  }, [user, token, selectedChat, authLoading]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.userId);
      markChatAsRead(selectedChat._id);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/chats/history/${user._id}`);
      const groupedChats = [];
      const seenPairs = new Set();
      for (const chat of res.data.chats) {
        const otherUserId = chat.sender._id === user._id ? chat.receiver._id : chat.sender._id;
        const pairKey = [user._id, otherUserId].sort().join(":");
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          groupedChats.push({
            _id: chat._id,
            userId: otherUserId,
            username: chat.sender._id === user._id ? chat.receiver.username : chat.sender.username,
            lastMessage: chat.message || (chat.file === "file" ? "File sent" : "Voice message"),
            createdAt: chat.createdAt,
            unreadCount: chat.read || chat.sender._id === user._id ? 0 : 1,
          });
        } else {
          const existingChat = groupedChats.find((c) => c.userId === otherUserId);
          if (!chat.read && chat.sender._id !== user._id) {
            existingChat.unreadCount = (existingChat.unreadCount || 0) + 1;
          }
          if (new Date(chat.createdAt) > new Date(existingChat.createdAt)) {
            existingChat._id = chat._id;
            existingChat.lastMessage = chat.message || (chat.file === "file" ? "File sent" : "Voice message");
            existingChat.createdAt = chat.createdAt;
          }
        }
      }
      setChats(groupedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error("Failed to load chats");
      console.error("Fetch chats error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/chats/history/${userId}`);
      setMessages(res.data.chats);
    } catch (error) {
      toast.error("Failed to load messages");
      console.error("Fetch messages error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setIsLoading(true);
      const endpoint = user.role === "Lawyer" ? "/cases" : "/users/lawyers";
      const res = await api.get(endpoint);
      console.log("Available users response:", res.data); // Debug log
      if (user.role === "Lawyer") {
        const clients = res.data.cases
          .filter((c) => c.assigned_lawyer && c.assigned_lawyer._id === user._id)
          .map((c) => ({
            _id: c.client._id,
            username: c.client.username || "Client",
          }));
        setAvailableUsers(clients);
      } else {
        const lawyers = res.data.lawyers || res.data.users || [];
        setAvailableUsers(lawyers);
      }
      setShowUserModal(true);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Fetch users error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = async (receiverId) => {
    try {
      const res = await api.post("/chats/start", { receiver: receiverId });
      fetchChats();
      setSelectedChat({
        _id: res.data.chat._id,
        userId: receiverId,
        username: res.data.chat.receiver.username,
      });
      setIsChatOpen(true);
      socketRef.current.emit("newChat", res.data.chat);
      toast.success("Chat started");
      setShowUserModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start chat");
      console.error("Start chat error:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const formData = new FormData();
    formData.append("receiver", selectedChat.userId);
    if (newMessage.trim()) formData.append("message", newMessage);
    if (file) formData.append("file", file);

    try {
      const res = await api.post("/chats/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => [...prev, res.data.chat]);
      setNewMessage("");
      setFile(null);
      fileInputRef.current.value = null;
      socketRef.current.emit("new_message", res.data.chat);
      fetchChats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      console.error("Send message error:", error);
    }
  };

  const deleteChat = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
        setIsChatOpen(false);
      }
      socketRef.current.emit("chatDeleted", chatId);
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error("Delete chat error:", error);
    }
  };

  const blockUser = async (userId) => {
    try {
      await api.post(`/chats/block/${userId}`);
      setBlockedUsers((prev) => [...new Set([...prev, userId])]);
      socketRef.current.emit("userBlocked", { userId });
    } catch (error) {
      toast.error("Failed to block user");
      console.error("Block user error:", error);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await api.post(`/chats/unblock/${userId}`);
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
      socketRef.current.emit("userUnblocked", { userId });
    } catch (error) {
      toast.error("Failed to unblock user");
      console.error("Unblock user error:", error);
    }
  };

  const markChatAsRead = async (chatId) => {
    try {
      await api.patch(`/chats/${chatId}/read`);
      fetchChats();
    } catch (error) {
      console.error("Mark chat as read error:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB");
        return;
      }
      const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".png", ".mp3", ".wav"];
      const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();
      if (!allowedTypes.includes(ext)) {
        toast.error("Only PDF, DOC, DOCX, JPG, PNG, MP3, and WAV files are allowed");
        return;
      }
      setFile(selectedFile);
    }
  };

  const canStartChat = (receiverId) => {
    if (user.role === "Client") return true;
    return availableUsers.some((u) => u._id === receiverId);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setIsChatOpen(true);
  };

  if (authLoading || !user || !token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div
        className={`w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col ${
          isChatOpen ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <button
            onClick={fetchAvailableUsers}
            className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Start New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && <p className="p-4 text-gray-500">Loading chats...</p>}
          {chats.length === 0 && !isLoading && (
            <p className="p-4 text-gray-500">No chats available</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedChat?._id === chat._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{chat.username}</p>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(chat.createdAt), "MMM d, HH:mm")}
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`w-full md:w-2/3 flex flex-col ${
          isChatOpen ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="md:hidden mr-2 text-gray-600"
                >
                  <FiArrowLeft size={24} />
                </button>
                <h3 className="text-lg font-medium text-gray-800">{selectedChat.username}</h3>
              </div>
              <div className="flex space-x-2">
                {blockedUsers.includes(selectedChat.userId) ? (
                  <button
                    onClick={() => unblockUser(selectedChat.userId)}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    <FiUnlock size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => blockUser(selectedChat.userId)}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    <FiLock size={20} />
                  </button>
                )}
                <button
                  onClick={() => deleteChat(selectedChat._id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {isLoading && <p className="text-gray-500">Loading messages...</p>}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-4 flex ${
                    msg.sender._id === user._id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender._id === user._id
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.message && <p>{msg.message}</p>}
                    {msg.file && (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        {msg.file.split("/").pop()}
                      </a>
                    )}
                    <p className="text-xs mt-1 opacity-75">
                      {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {!blockedUsers.includes(selectedChat.userId) && (
              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png,.mp3,.wav"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    <FiPaperclip size={20} />
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>
                )}
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Select User</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            {availableUsers.length === 0 && (
              <p className="text-gray-500">No users available</p>
            )}
            {availableUsers.map((u) => (
              <div
                key={u._id}
                className="p-2 border-b border-gray-200 flex justify-between items-center"
              >
                <p className="text-gray-800">{u.username}</p>
                {canStartChat(u._id) && !blockedUsers.includes(u._id) && (
                  <button
                    onClick={() => startChat(u._id)}
                    className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;