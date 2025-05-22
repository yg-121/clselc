"use client"

import { useState, useEffect, useContext } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthContext } from "../../context/AuthContext.jsx"
import { ScrollArea } from "../ui/scroll-area.jsx"
import { Button } from "../ui/button.jsx"
import { 
  Home, Users as UsersIcon, Briefcase, Bell, FileText, 
  User, Menu, X, LogOut, Settings 
} from "lucide-react"
import Dashboard from "../../pages/admin/Dashboard.jsx"
import Users from "../../pages/admin/Users.jsx"
import SimpleUserList from "../../pages/admin/SimpleUserList.jsx"
import Cases from "../../pages/admin/Cases.jsx"
import Notifications from "../../pages/admin/Notifications.jsx"
import AuditLogs from "../../pages/admin/AuditLogs.jsx"
import Profile from "../../pages/admin/Profile.jsx"
import ErrorAlert from "../admin/ErrorAlert.jsx"
import { Badge } from "../ui/badge.jsx"
import api from "../../services/api.js"  // Import the API service
import { initializeSocket, disconnectSocket } from "../../utils/socketUtils.js";

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
  const [socket, setSocket] = useState(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const navigate = useNavigate()

  // Fetch unread notification count with more debugging
  const fetchNotificationCount = async () => {
    try {
      console.log("Fetching notification count...");
      const response = await api.get("/notifications/admin/notifications");
      console.log("Notification response:", response.data);
      
      // Use the unreadCount from the API response
      if (response.data && typeof response.data.unreadCount === 'number') {
        console.log("Unread notification count from API:", response.data.unreadCount);
        setNotificationCount(response.data.unreadCount);
      } else {
        console.warn("Unexpected notification response format:", response.data);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      setError("Failed to fetch notifications");
      setNotificationCount(0); // Set to 0 on error
    }
  };

  // Call fetchNotificationCount when the component mounts
  useEffect(() => {
    fetchNotificationCount();
    // Set up a timer to refresh the count periodically
    const intervalId = setInterval(fetchNotificationCount, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(intervalId); // Clean up on unmount
    };
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "Admin") {
      navigate("/login");
      return;
    }

    // Initialize socket with better error handling
    let socketInstance = null;
    try {
      socketInstance = initializeSocket();
      if (socketInstance) {
        console.log("Socket initialized in AdminDashboard");
        
        socketInstance.on("new_notification", (data) => {
          console.log("New notification received:", data);
          setNotificationCount((prev) => prev + 1);
          queryClient.invalidateQueries("notifications");
        });
        
        setSocket(socketInstance);
      } else {
        console.warn("Failed to initialize socket in AdminDashboard");
      }
    } catch (error) {
      console.error("Error initializing socket in AdminDashboard:", error);
    }

    return () => {
      // Clean up socket connection
      if (socketInstance) {
        try {
          socketInstance.off("new_notification");
          disconnectSocket();
        } catch (error) {
          console.error("Error disconnecting socket:", error);
        }
      }
    };
  }, [user, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const clearError = () => {
    setError("")
  }

  // Function to reset notification count (called after marking notifications as read)
  const resetNotificationCount = () => {
    fetchNotificationCount();
  };

  if (!user) {
    return null // Will be redirected by useEffect
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard/admin",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Users",
      path: "/dashboard/admin/users",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      name: "Cases",
      path: "/dashboard/admin/cases",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "Notifications",
      path: "/dashboard/admin/notifications",
      icon: <Bell className="w-5 h-5" />,
      badge: notificationCount > 0 ? notificationCount : null,
    },
    {
      name: "Audit Logs",
      path: "/dashboard/admin/audit",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/dashboard/admin/profile",
      icon: <User className="w-5 h-5" />,
    },
  ]

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`bg-card text-card-foreground fixed md:sticky top-0 z-30 h-screen transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={`font-bold text-xl transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "md:opacity-0"}`}>
              Legal Admin
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-64px)]">
            <nav className="p-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Button
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      className={`w-full justify-start ${!sidebarOpen && "md:justify-center"}`}
                      onClick={() => navigate(item.path)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className={`${!sidebarOpen && "md:hidden"}`}>{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="ml-auto"
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </Badge>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-card border-b h-16 flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {notificationCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/dashboard/admin/notifications")}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1"
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Badge>
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/dashboard/admin/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main content */}
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








