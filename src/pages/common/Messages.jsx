import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHooks.js';
import { useApi } from '../../hooks/useApi.js';
import { chat } from '../../services/api.js';
import socketService from '../../services/socket.js';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { loading, error, callApi } = useApi();
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchRecentChats = async () => {
      try {
        const response = await callApi(() => chat.getChatHistory(user._id));
        if (!response.success || !response.data?.chats) {
          setRecentChats([]);
          return;
        }
        const uniqueUsers = new Set();
        const recent = response.data.chats
          .map((chat) => ({
            userId:
              chat.sender._id === user._id ? chat.receiver._id : chat.sender._id,
            username:
              chat.sender._id === user._id
                ? chat.receiver.username
                : chat.sender.username,
            role:
              chat.sender._id === user._id
                ? chat.receiver.role
                : chat.sender.role,
            lastMessage: chat.message,
            timestamp: chat.createdAt,
          }))
          .filter((chat) => {
            if (!uniqueUsers.has(chat.userId)) {
              uniqueUsers.add(chat.userId);
              return true;
            }
            return false;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentChats(recent);
      } catch (err) {
        console.error('[Messages] Fetch recent chats error:', err.response?.data || err.message);
        toast.error('Failed to load recent chats');
        setRecentChats([]);
      }
    };

    fetchRecentChats();

    const socket = socketService.initialize(user._id);
    if (socket) {
      socketService.on('new_message', (msg) => {
        console.log('[Messages] New message:', msg);
        setChatHistory((prev) => {
          if (
            msg.sender._id === selectedUser ||
            msg.receiver._id === user._id
          ) {
            return [...prev, msg];
          }
          return prev;
        });
        setRecentChats((prev) => {
          const otherUser =
            msg.sender._id === user._id ? msg.receiver : msg.sender;
          const updated = [
            {
              userId: otherUser._id,
              username: otherUser.username,
              role: otherUser.role,
              lastMessage: msg.message,
              timestamp: msg.createdAt,
            },
            ...prev.filter((chat) => chat.userId !== otherUser._id),
          ];
          return updated.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
        toast.success(`New message from ${msg.sender.username}`);
      });
    }

    return () => {
      socketService.off('new_message');
    };
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const fetchChatHistory = async () => {
      try {
        const response = await callApi(() => chat.getChatHistory(user._id));
        if (!response.success || !response.data?.chats) {
          setChatHistory([]);
          return;
        }
        const filteredChats = response.data.chats.filter(
          (chat) =>
            chat.sender._id === selectedUser || chat.receiver._id === selectedUser
        );
        setChatHistory(filteredChats);
      } catch (error) {
        console.error('[Messages] Fetch chat history error:', error.response?.data || error.message);
        toast.error('Failed to load chat history');
        setChatHistory([]);
      }
    };

    fetchChatHistory();
  }, [selectedUser, user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;
    try {
      const response = await callApi(() =>
        chat.sendMessage({ receiver: selectedUser, message })
      );
      if (!response.success || !response.data?.chat) {
        throw new Error(response.error || 'Invalid response: No chat data');
      }
      console.log('[Messages] Send message response:', response.data);
      setChatHistory((prev) => [...prev, response.data.chat]);
      setRecentChats((prev) => {
        const otherUser = {
          id: selectedUser,
          name: response.data.chat.receiver.username,
          role: response.data.chat.receiver.role,
        };
        const updated = [
          {
            userId: selectedUser,
            username: otherUser.name,
            role: otherUser.role,
            lastMessage: message,
            timestamp: new Date(),
          },
          ...prev.filter((chat) => chat.userId !== selectedUser),
        ];
        return updated.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });
      setMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('[Messages] Send message error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || error.message || 'Failed to send message');
    }
  };

  const handleMarkAsRead = async (chatId) => {
    try {
      const response = await callApi(() => chat.markChatAsRead(chatId));
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark as read');
      }
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, read: true } : chat
        )
      );
      toast.success('Message marked as read');
    } catch (error) {
      console.error('[Messages] Mark as read error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      {(authError || error) && <div className="text-red-500 mb-4">{authError || error}</div>}
      {authLoading || loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
          <div className="w-1/4 bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Conversations</h3>
            {recentChats.length === 0 ? (
              <div>No conversations yet</div>
            ) : (
              recentChats.map((chat) => (
                <div
                  key={chat.userId}
                  className={`p-2 cursor-pointer rounded ${
                    selectedUser === chat.userId
                      ? 'bg-blue-200'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedUser(chat.userId)}
                >
                  <p className="font-semibold">
                    {chat.username} ({chat.role})
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="w-3/4 flex flex-col bg-white rounded-lg shadow">
            {selectedUser ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-600">No messages yet</p>
                  ) : (
                    chatHistory.map((chat) => (
                      <div
                        key={chat._id}
                        className={`p-3 my-2 rounded-lg ${
                          chat.sender._id === user._id
                            ? 'ml-8 bg-blue-100'
                            : 'mr-8 bg-gray-100'
                        }`}
                      >
                        <p className="font-semibold">
                          {chat.sender.username}: {chat.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(chat.createdAt).toLocaleString()}
                          {chat.read ? ' · Read' : ' · Unread'}
                          {chat.receiver._id === user._id && !chat.read && (
                            <button
                              onClick={() => handleMarkAsRead(chat._id)}
                              className="ml-2 text-blue-600 hover:underline"
                            >
                              Mark as Read
                            </button>
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-600">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;