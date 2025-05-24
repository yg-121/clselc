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
import api from "../../services/api.js"
import { connectSocket, disconnectSocket } from "../../utils/socketUtils.js";

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

  const fetchNotificationCount = async () => {
    try {
      console.log("Fetching notification count...");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await api.get("/notifications/admin/notifications");
      console.log("Notification response:", response.data);
      
      if (response.data && typeof response.data.unreadCount === 'number') {
        console.log("Unread notification count from API:", response.data.unreadCount);
        setNotificationCount(response.data.unreadCount);
      } else {
        console.warn("Unexpected notification response format:", response.data);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error.message);
      setError("Failed to fetch notifications");
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login");
      return;
    }

    let socketInstance = null;
    let connectionTimeout = null;
    let retryAttempts = 3;
    let retryInterval = null;

    const initializeSocket = () => {
      const token = localStorage.getItem("token");
      if (user?._id && token) {
        try {
          console.log("Initializing socket with userId:", user._id, "Token present:", !!token);
          socketInstance = connectSocket(user._id);
          if (socketInstance) {
            socketInstance.on("connect", () => {
              console.log("Socket connected for admin dashboard:", socketInstance.id);
              retryAttempts = 3; // Reset retries on success
              clearInterval(retryInterval);
            });

            socketInstance.on("new_admin_notification", (notification) => {
              console.log("New admin notification received:", notification);
              setNotificationCount((prev) => prev + 1);
              queryClient.invalidateQueries("notifications");
            });

            socketInstance.on("connect_error", (err) => {
              console.error("Socket connection error in AdminDashboard:", err.message);
              setError("Failed to connect to real-time notifications: " + err.message);
              if (retryAttempts > 0) {
                retryAttempts--;
                console.log(`Retrying socket connection (${retryAttempts} attempts left)`);
              } else {
                clearInterval(retryInterval);
              }
            });

            socketInstance.on("error", (err) => {
              console.error("Socket error in AdminDashboard:", err.message);
            });

            setSocket(socketInstance);
          } else {
            console.warn("Failed to initialize socket: connectSocket returned null");
            if (retryAttempts > 0) {
              retryAttempts--;
              console.log(`Retrying socket connection (${retryAttempts} attempts left)`);
            }
          }
        } catch (error) {
          console.error("Error initializing socket in AdminDashboard:", error.message);
          setError("Failed to initialize real-time notifications");
          if (retryAttempts > 0) {
            retryAttempts--;
            console.log(`Retrying socket connection (${retryAttempts} attempts left)`);
          }
        }
      } else {
        console.warn("Cannot initialize socket: Missing userId or token", { userId: user?._id, hasToken: !!token });
        setError("Cannot connect to notifications: Missing authentication data");
      }
    };

    // Delay initial connection to avoid page load issues
    connectionTimeout = setTimeout(() => {
      initializeSocket();
      retryInterval = setInterval(() => {
        if (!socketInstance || !socketInstance.connected) {
          console.log("Retrying socket connection...");
          initializeSocket();
        } else {
          clearInterval(retryInterval);
        }
      }, 5000);
    }, 1000);

    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (retryInterval) {
        clearInterval(retryInterval);
      }
      if (socketInstance) {
        try {
          socketInstance.off("connect");
          socketInstance.off("new_admin_notification");
          socketInstance.off("connect_error");
          socketInstance.off("error");
          disconnectSocket();
          console.log("Socket disconnected from AdminDashboard");
        } catch (error) {
          console.error("Error disconnecting socket:", error.message);
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

  const resetNotificationCount = () => {
    fetchNotificationCount();
  };

  if (!user) {
    return null
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
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden" 
            onClick={toggleSidebar}
          ></div>
        )}

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

        <div className="flex-1 flex flex-col min-h-screen">
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