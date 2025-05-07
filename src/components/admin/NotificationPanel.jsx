"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useApi } from "../../hooks/useApi"
import { Bell, Check, AlertCircle, Info, Mail } from "lucide-react"
import Button from "../common/Button"

const NotificationPanel = ({ onNotificationRead }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const api = useApi()

  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [markingAsRead, setMarkingAsRead] = useState(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/notifications/admin/notifications")
        setNotifications(response.data.notifications || [])
        setError(null)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
        setError("Failed to load notifications. Please try again.")
        if (error.response && error.response.status === 401) {
          logout()
          navigate("/auth/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [api, logout, navigate])

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    setMarkingAsRead(notificationId)
    try {
      await api.patch(`/notifications/notifications/${notificationId}/read`)
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId ? { ...notification, status: "Read" } : notification,
        ),
      )
      showToast("Notification marked as read", "success")
      if (onNotificationRead) onNotificationRead()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      showToast("Failed to mark notification as read", "error")
      if (error.response && error.response.status === 401) {
        logout()
        navigate("/auth/login")
      }
    } finally {
      setMarkingAsRead(null)
    }
  }

  // Add a function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/mark-all-read");
      
      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          status: "Read"
        }))
      );
      
      showToast("All notifications marked as read", "success");
      if (onNotificationRead) onNotificationRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      showToast("Failed to mark all notifications as read", "error");
      if (error.response && error.response.status === 401) {
        logout();
        navigate("/auth/login");
      }
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "message":
        return <Mail className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  // Use the unreadCount from the API response instead of calculating it
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex items-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {unreadCount} Unread
          </span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">All Notifications</h2>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {unreadCount} Unread
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 flex items-start space-x-4 ${notification.status !== "Read" ? "bg-blue-50" : ""}`}
              >
                <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {notification.status !== "Read" && (
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleMarkAsRead(notification._id)}
                      variant="secondary"
                      size="sm"
                      className="inline-flex items-center"
                      isLoading={markingAsRead === notification._id}
                      disabled={markingAsRead === notification._id}
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4 mr-1" /> Mark as read
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
            toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default NotificationPanel

