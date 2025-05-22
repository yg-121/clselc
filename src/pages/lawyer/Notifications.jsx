import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/authHooks";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import { Bell, Check, AlertCircle, Info, Mail, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function LawyerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const { user } = useAuth();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get("http://localhost:5000/api/notifications/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchNotifications();
    }

    let socket = null;
    if (user?._id) {
      socket = connectSocket(user._id);
      
      socket.on('connect', fetchNotifications);
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast.info(notification.message);
      });
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('new_notification');
        disconnectSocket();
      }
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.patch(`http://localhost:5000/api/notifications/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, status: "Read" } : notification
        )
      );
      
      toast.success("Marked as read");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      toast.error("Failed to update");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.patch("http://localhost:5000/api/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(
        notifications.map((notification) => ({ ...notification, status: "Read" }))
      );
      toast.success("All marked as read");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to update");
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "Bid":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "BidAccepted":
        return <Check className="h-4 w-4 text-green-500" />;
      case "Appointment":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "Chat":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date to be more compact
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Pagination logic
  const pageCount = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
        {notifications.some(n => n.status !== "Read") && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {paginatedNotifications.map((notification) => (
              <li
                key={notification._id}
                className={`px-4 py-3 flex items-start ${notification.status !== "Read" ? "bg-blue-50" : ""}`}
              >
                <div className="flex-shrink-0 mt-1 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-tight">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</p>
                </div>
                {notification.status !== "Read" && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="flex-shrink-0 ml-2 p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPreviousPage}
          className={`px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-gray-600">
          Page {currentPage + 1} of {pageCount}
        </span>
        <button
          onClick={goToNextPage}
          className={`px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${currentPage === pageCount - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentPage === pageCount - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}





