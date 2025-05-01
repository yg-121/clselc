import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Send, User, Check, CheckCheck, Search, Paperclip } from "lucide-react";

export default function MessagesPage({ userRole }) {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          contactName: userRole === "client" ? "Abebe Kebede" : "Sara Tadesse",
          contactRole: userRole === "client" ? "lawyer" : "client",
          lastMessage: "I'll send you the documents tomorrow.",
          lastMessageTime: "10:30 AM",
          unreadCount: 2,
          online: true,
          messages: [
            {
              id: 1,
              content: `Hello, I'm ${
                userRole === "client" ? "Abebe Kebede" : "Sara Tadesse"
              }. How can I help you with your case?`,
              timestamp: "10:00 AM",
              sender: "contact",
              status: "read",
            },
            {
              id: 2,
              content: "I need help with my property dispute case.",
              timestamp: "10:05 AM",
              sender: "user",
              status: "read",
            },
            {
              id: 3,
              content:
                "I understand. Can you provide more details about the dispute?",
              timestamp: "10:10 AM",
              sender: "contact",
              status: "read",
            },
            {
              id: 4,
              content:
                "It's regarding the boundary line between my property and my neighbor's.",
              timestamp: "10:15 AM",
              sender: "user",
              status: "read",
            },
            {
              id: 5,
              content:
                "I see. Do you have any documentation or surveys of the property?",
              timestamp: "10:20 AM",
              sender: "contact",
              status: "read",
            },
            {
              id: 6,
              content: "Yes, I have the original deed and a recent survey.",
              timestamp: "10:25 AM",
              sender: "user",
              status: "read",
            },
            {
              id: 7,
              content:
                "Great. I'll need to review those documents. Can you send them to me?",
              timestamp: "10:30 AM",
              sender: "contact",
              status: "delivered",
            },
          ],
        },
        {
          id: 2,
          contactName: userRole === "client" ? "Tigist Haile" : "John Smith",
          contactRole: userRole === "client" ? "lawyer" : "client",
          lastMessage: "The hearing is scheduled for next week.",
          lastMessageTime: "Yesterday",
          unreadCount: 0,
          online: false,
          messages: [
            {
              id: 1,
              content: "Hello, I'm reviewing your contract case.",
              timestamp: "Yesterday, 2:00 PM",
              sender: "contact",
              status: "read",
            },
            {
              id: 2,
              content:
                "Thank you. Do you need any additional information from me?",
              timestamp: "Yesterday, 2:10 PM",
              sender: "user",
              status: "read",
            },
            {
              id: 3,
              content:
                "Not at the moment. I've scheduled a hearing for next week.",
              timestamp: "Yesterday, 2:15 PM",
              sender: "contact",
              status: "read",
            },
            {
              id: 4,
              content: "Great, what time should I be available?",
              timestamp: "Yesterday, 2:20 PM",
              sender: "user",
              status: "read",
            },
            {
              id: 5,
              content:
                "The hearing is scheduled for next week, Tuesday at 10:00 AM.",
              timestamp: "Yesterday, 2:25 PM",
              sender: "contact",
              status: "read",
            },
          ],
        },
        {
          id: 3,
          contactName:
            userRole === "client" ? "Solomon Tesfaye" : "Meron Alemu",
          contactRole: userRole === "client" ? "lawyer" : "client",
          lastMessage: "Please review the contract.",
          lastMessageTime: "Mar 15",
          unreadCount: 1,
          online: true,
          messages: [
            {
              id: 1,
              content: "I've drafted the contract as we discussed.",
              timestamp: "Mar 15, 9:00 AM",
              sender: "contact",
              status: "read",
            },
            {
              id: 2,
              content: "Thank you. I'll take a look at it.",
              timestamp: "Mar 15, 9:15 AM",
              sender: "user",
              status: "read",
            },
            {
              id: 3,
              content:
                "Please review it and let me know if you have any questions or need any changes.",
              timestamp: "Mar 15, 9:20 AM",
              sender: "contact",
              status: "sent",
            },
          ],
        },
      ];

      setConversations(mockConversations);

      if (conversationId) {
        const conversation = mockConversations.find(
          (c) => c.id.toString() === conversationId
        );
        setSelectedConversation(conversation || mockConversations[0]);
      } else {
        setSelectedConversation(mockConversations[0]);
      }

      setLoading(false);
    }, 1000);
  }, [userRole, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedConversation) return;

    const newMsg = {
      id: selectedConversation.messages.length + 1,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "user",
      status: "sent",
    };

    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMsg],
      lastMessage: newMessage,
      lastMessageTime: "Just now",
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );
    setSelectedConversation(updatedConversation);
    setNewMessage("");
  };

  const handleSelectConversation = (conversation) => {
    const updatedConversation = {
      ...conversation,
      unreadCount: 0,
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === conversation.id ? updatedConversation : conv
      )
    );
    setSelectedConversation(updatedConversation);
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    return timestamp;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-500" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
          <div className="flex h-[calc(80vh-2rem)] flex-col md:flex-row">
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredConversations.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => (
                      <li
                        key={conversation.id}
                        className={`cursor-pointer hover:bg-gray-50 transition-all duration-300 ${
                          selectedConversation?.id === conversation.id
                            ? "bg-primary/5"
                            : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="relative px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                {conversation.contactName.charAt(0)}
                              </div>
                              {conversation.online && (
                                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white"></span>
                              )}
                            </div>
                            <div className="ml-4 flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {conversation.contactName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {conversation.lastMessageTime}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-500 truncate">
                                  {conversation.lastMessage}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-xs font-medium text-white">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 capitalize">
                                {conversation.contactRole}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <User className="h-12 w-12 text-gray-500 mb-2" />
                    <p className="text-gray-500 text-center">
                      No conversations found
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {selectedConversation.contactName.charAt(0)}
                        </div>
                        {selectedConversation.online && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">
                          {selectedConversation.contactName}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {selectedConversation.contactRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto bg-card">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {message.sender === "contact" && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium self-end mr-2">
                              {selectedConversation.contactName.charAt(0)}
                            </div>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === "user"
                                ? "bg-primary text-white"
                                : "bg-white text-foreground border border-gray-200 shadow-sm"
                            }`}
                          >
                            <p>{message.content}</p>
                            <div
                              className={`text-xs mt-1 flex items-center justify-end ${
                                message.sender === "user"
                                  ? "text-white/80"
                                  : "text-gray-500"
                              }`}
                            >
                              <span>
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.sender === "user" && (
                                <span className="ml-1">
                                  {getStatusIcon(message.status)}
                                </span>
                              )}
                            </div>
                          </div>
                          {message.sender === "user" && (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium self-end ml-2">
                              {userRole === "client" ? "C" : "L"}
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 bg-card">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all duration-300"
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 mx-2 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-foreground placeholder-gray-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <User className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No conversation selected
                  </h3>
                  <p className="text-gray-500 text-center">
                    Select a conversation from the list to start messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
