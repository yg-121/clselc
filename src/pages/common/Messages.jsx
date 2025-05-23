import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHooks';
import { useApi } from '../../hooks/useApi';
import { chat } from '../../services/api';
import socketService from '../../services/socket';
import { toast } from 'react-hot-toast';
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAudio, FaFile } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { Send, Paperclip, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { loading, callApi } = useApi();
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      navigate('/login');
      return;
    }

    const fetchRecentChats = async () => {
      try {
        const response = await callApi(() => chat.getChatHistory(authUser._id));
        console.log('[Messages] getChatHistory response:', response.data);
        if (!response.success || !response.data?.chats) {
          setRecentChats([]);
          setUnreadCounts({});
          return;
        }
        const uniqueUsers = new Set();
        const unread = {};
        const recent = response.data.chats
          .map((chat) => {
            const otherUserId = chat.sender._id === authUser._id ? chat.receiver._id : chat.sender._id;
            if (chat.receiver._id === authUser._id && !chat.read) {
              unread[otherUserId] = (unread[otherUserId] || 0) + 1;
            }
            return {
              userId: otherUserId,
              username: chat.sender._id === authUser._id ? chat.receiver.username : chat.sender.username,
              role: chat.sender._id === authUser._id ? chat.receiver.role : chat.sender.role,
              lastMessage: chat.message || (chat.fileName ? `[File: ${chat.fileName}]` : ''),
              timestamp: chat.createdAt,
            };
          })
          .filter((chat) => {
            if (!uniqueUsers.has(chat.userId)) {
              uniqueUsers.add(chat.userId);
              return true;
            }
            return false;
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentChats(recent);
        setUnreadCounts(unread);
        console.log('[Messages] Unread counts:', unread);
      } catch (err) {
        console.error('[Messages] Fetch recent chats error:', err.response?.data || err.message);
        toast.error('Failed to load recent chats');
        setRecentChats([]);
        setUnreadCounts({});
      }
    };

    fetchRecentChats();

    const socket = socketService.initialize(authUser._id);
    if (socket) {
      socketService.on('new_message', (msg) => {
        console.log('[Messages] New message:', msg);
        setChatHistory((prev) => {
          if (msg.sender._id === selectedUser || msg.receiver._id === authUser._id) {
            return [...prev, msg];
          }
          return prev;
        });
        setRecentChats((prev) => {
          const otherUser = msg.sender._id === authUser._id ? msg.receiver : msg.sender;
          const updated = [
            {
              userId: otherUser._id,
              username: otherUser.username,
              role: otherUser.role,
              lastMessage: msg.message || (msg.fileName ? `[File: ${msg.fileName}]` : ''),
              timestamp: msg.createdAt,
            },
            ...prev.filter((chat) => chat.userId !== otherUser._id),
          ];
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
        if (msg.receiver._id === authUser._id && !msg.read && msg.sender._id !== selectedUser) {
          setUnreadCounts((prev) => {
            const newCounts = {
              ...prev,
              [msg.sender._id]: (prev[msg.sender._id] || 0) + 1,
            };
            console.log('[Messages] Updated unread counts:', newCounts);
            return newCounts;
          });
        }
        toast.success(`New message from ${msg.sender.username}`);
      });

      socketService.on('chat_deleted', ({ chatId }) => {
        console.log('[Messages] Chat deleted:', chatId);
        setChatHistory((prev) => prev.filter((chat) => chat._id !== chatId));
        setRecentChats((prev) => {
          const chat = chatHistory.find((c) => c._id === chatId);
          if (!chat) return prev;
          const otherUserId = chat.sender._id === authUser._id ? chat.receiver._id : chat.sender._id;
          const hasOtherChats = chatHistory.some(
            (c) => c._id !== chatId && (c.sender._id === otherUserId || c.receiver._id === otherUserId)
          );
          if (hasOtherChats) return prev;
          return prev.filter((c) => c.userId !== otherUserId);
        });
        toast.success('Chat deleted');
      });
    }

    return () => {
      socketService.off('new_message');
      socketService.off('chat_deleted');
    };
  }, [authUser, authLoading, navigate]);

  useEffect(() => {
    if (!selectedUser || !authUser) return;

    const fetchChatHistory = async () => {
      try {
        const response = await callApi(() => chat.getChatHistory(authUser._id));
        if (!response.success || !response.data?.chats) {
          setChatHistory([]);
          return;
        }
        const filteredChats = response.data.chats.filter(
          (chat) => chat.sender._id === selectedUser || chat.receiver._id === selectedUser
        );
        setChatHistory(filteredChats);

        // Auto-mark unread messages as read
        const unreadChats = filteredChats.filter(
          (chat) => chat.receiver._id === authUser._id && !chat.read
        );
        for (const chat of unreadChats) {
          try {
            const readResponse = await callApi(() => chat.markChatAsRead(chat._id));
            if (readResponse.success) {
              setChatHistory((prev) =>
                prev.map((c) => (c._id === chat._id ? { ...c, read: true } : c))
              );
              setUnreadCounts((prev) => {
                const newCount = (prev[selectedUser] || 1) - 1;
                const newCounts = { ...prev, [selectedUser]: newCount >= 0 ? newCount : 0 };
                console.log('[Messages] Unread counts after mark as read:', newCounts);
                return newCounts;
              });
            }
          } catch (error) {
            console.error('[Messages] Auto-mark as read error:', error.response?.data || error.message);
          }
        }
      } catch (error) {
        console.error('[Messages] Fetch chat history error:', error.response?.data || error.message);
        toast.error('Failed to load chat history');
        setChatHistory([]);
      }
    };

    fetchChatHistory();
  }, [selectedUser, authUser]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="inline mr-2" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="inline mr-2" />;
    if (fileType.includes('msword') || fileType.includes('wordprocessingml')) return <FaFileWord className="inline mr-2" />;
    if (fileType.includes('image')) return <FaFileImage className="inline mr-2" />;
    if (fileType.includes('audio')) return <FaFileAudio className="inline mr-2" />;
    return <FaFile className="inline mr-2" />;
  };

  const handleSendMessage = async () => {
    if (!selectedUser || (!message.trim() && !file)) return;
    if (isBlocked) {
      toast.error('Cannot send message to blocked user');
      return;
    }
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('receiver', selectedUser);
        if (message.trim()) formData.append('message', message);
        formData.append('file', file);
        response = await callApi(() => chat.sendMessageWithFile(formData));
      } else {
        response = await callApi(() => chat.sendMessage({ receiver: selectedUser, message }));
      }
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
            lastMessage: response.data.chat.message || (response.data.chat.fileName ? `[File: ${response.data.chat.fileName}]` : ''),
            timestamp: response.data.chat.createdAt,
          },
          ...prev.filter((chat) => chat.userId !== selectedUser),
        ];
        return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
      setMessage('');
      setFile(null);
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

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    try {
      const response = await callApi(() => chat.deleteChat(chatToDelete));
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete chat');
      }
      setDeleteDialogOpen(false);
      setChatToDelete(null);
      toast.success('Chat deleted');
    } catch (error) {
      console.error('[Messages] Delete chat error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Failed to delete chat');
    }
  };

  const handleBlockToggle = async () => {
    try {
      const response = await callApi(() =>
        isBlocked ? chat.unblockUser(selectedUser) : chat.blockUser(selectedUser)
      );
      if (!response.success) {
        throw new Error(response.error || `Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      }
      setIsBlocked(!isBlocked);
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    } catch (error) {
      console.error('[Messages] Block toggle error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || `Failed to ${isBlocked ? 'unblock' : 'block'} user`);
    }
  };

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
        {recentChats.length === 0 ? (
          <div className="p-4 text-gray-500">No conversations yet</div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-4rem)]">
            {recentChats.map((chat) => (
              <motion.div
                key={chat.userId}
                className={`p-3 cursor-pointer border-b border-gray-100 transition-all duration-300 ${
                  selectedUser === chat.userId
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100'
                    : 'hover:bg-gradient-to-r from-blue-50 to-blue-100'
                }`}
                onClick={() => setSelectedUser(chat.userId)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{chat.username}</p>
                    {unreadCounts[chat.userId] > 0 && (
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full px-2 py-1 text-xs"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        {unreadCounts[chat.userId]}
                      </motion.div>
                    )}
                    {isBlocked && chat.userId === selectedUser && (
                      <Badge className="bg-gradient-to-r from-red-500 to-red-400 text-white">
                        Blocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">{chat.lastMessage}</p>
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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800 relative">
                  {recentChats.find((chat) => chat.userId === selectedUser)?.username || 'User'}
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                </h3>
                {isBlocked && (
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-red-400 text-white rounded-full px-2 py-1 text-xs"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Blocked
                  </motion.div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-blue-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleBlockToggle}>
                    {isBlocked ? 'Unblock User' : 'Block User'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No messages yet</p>
              ) : (
                <AnimatePresence>
                  {chatHistory.map((chat) => (
                    <motion.div
                      key={chat._id}
                      className={`flex mb-3 ${
                        chat.sender._id === authUser._id ? 'justify-end' : 'justify-start'
                      }`}
                      initial={{ opacity: 0, x: chat.sender._id === authUser._id ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: chat.sender._id === authUser._id ? 50 : -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl relative ${
                          chat.sender._id === authUser._id
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        {/* Message Tail */}
                        <div
                          className={`absolute bottom-0 w-3 h-3 ${
                            chat.sender._id === authUser._id
                              ? 'right-[-6px] bg-blue-500'
                              : 'left-[-6px] bg-white'
                          }`}
                          style={{
                            clipPath: chat.sender._id === authUser._id
                              ? 'polygon(0 0, 100% 0, 100% 100%)'
                              : 'polygon(0 0, 100% 0, 0 100%)',
                          }}
                        />

                        {chat.message && <p>{chat.message}</p>}
                        {chat.fileUrl && (
                          <p>
                            {getFileIcon(chat.fileType)}
                            <a
                              href={`${import.meta.env.VITE_SOCKET_URL}${chat.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${
                                chat.sender._id === authUser._id
                                  ? 'text-blue-100 hover:underline'
                                  : 'text-blue-600 hover:underline'
                              }`}
                            >
                              {chat.fileName}
                            </a>
                          </p>
                        )}
                        <motion.div
                          className="flex items-center justify-between mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p
                            className={`text-xs ${
                              chat.sender._id === authUser._id ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {new Date(chat.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </motion.div>
                        {(chat.sender._id === authUser._id || chat.receiver._id === authUser._id) && (
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Trash2
                              className="absolute top-1 right-1 w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                              onClick={() => {
                                setChatToDelete(chat._id);
                                setDeleteDialogOpen(true);
                              }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Input Bar */}
            <motion.div
              className="p-3 bg-gray-100 shadow-inner border-t border-gray-200 sticky bottom-0"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <motion.label
                  className="cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
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
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 p-2 bg-white rounded-full border ${
                    isBlocked ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-gradient-to-r focus:ring-from-blue-500 focus:ring-to-blue-400 transition-all duration-300`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isBlocked}
                />
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || isBlocked}
                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </Button>
                </motion.div>
              </div>
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
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;