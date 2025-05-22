"use client"

import { useState, useEffect, useContext } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthContext } from "../../context/AuthContextDefinition"
import AdminSidebar from "../admin/Sidebar"
import AdminHeader from "../admin/Header"
import Dashboard from "../../pages/admin/Dashboard"
import Users from "../../pages/admin/Users"
import SimpleUserList from "../../pages/admin/SimpleUserList"
import Cases from "../../pages/admin/Cases"
import Notifications from "../../pages/admin/Notifications"
import AuditLogs from "../../pages/admin/AuditLogs"
import Appointments from "../../pages/admin/Appointments"
import Profile from "../../pages/admin/Profile"
import ErrorAlert from "../admin/ErrorAlert"
import io from "socket.io-client"

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {  
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [socket, setSocket] = useState(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "Admin") {
      navigate("/login")
      return
    }

    // Connect to Socket.IO server
    const socketInstance = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server")
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError("Failed to connect to notification server")
    })

    socketInstance.on("new_notification", (data) => {
      console.log("New notification received:", data)
      setNotificationCount((prev) => prev + 1)
      queryClient.invalidateQueries("notifications")
    })

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [user, navigate])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const clearError = () => {
    setError("")
  }

  const resetNotificationCount = () => {
    setNotificationCount(0)
  }

  if (!user) {
    return null // Will be redirected by useEffect
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} notificationCount={notificationCount} />

        <div className="flex-1 flex flex-col">
          <AdminHeader
            user={user}
            logout={logout}
            toggleSidebar={toggleSidebar}
            notificationCount={notificationCount}
          />

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {error && <ErrorAlert message={error} onClose={clearError} />}

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/simple-users" element={<SimpleUserList />} />
              <Route path="/cases" element={<Cases />} />
              <Route
                path="/notifications"
                element={<Notifications resetNotificationCount={resetNotificationCount} />}
              />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </QueryClientProvider>
  )
}

export default AdminDashboard








