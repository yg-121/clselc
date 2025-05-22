import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authHooks.js";
import { Menu, X, User, LogOut, Bell, AlertTriangle } from "lucide-react";
import { connectSocket, disconnectSocket } from "../../utils/socket.js";
import axios from "axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (user && user._id) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage for Navbar socket connection');
        return;
      }
  
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnreadNotifications(response.data.count || 0);
        } catch (error) {
          console.error('Failed to fetch unread notifications count:', error);
        }
      };
  
      fetchUnreadCount();
  
      const socketTimeout = setTimeout(() => {
        const socket = connectSocket(user._id);
        if (socket) {
          socket.on('new_notification', () => {
            setUnreadNotifications((prev) => prev + 1);
          });
        } else {
          console.error('Socket connection failed in Navbar');
        }
      }, 100);
  
      return () => {
        clearTimeout(socketTimeout);
        disconnectSocket();
      };
    }
  }, [user]);

  // Handle notification icon click
  const handleNotificationClick = () => {
    if (!user) return;
    
    // Navigate to the appropriate notifications page based on user role
    if (user.role === "Lawyer") {
      navigate("/lawyer/notifications");
    } else if (user.role === "Client") {
      navigate("/client/notifications");
    } else if (user.role === "Admin") {
      navigate("/dashboard/admin/notifications");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Original handleLogout function (keep this for backward compatibility)
  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const clientNavItems = [
    { name: "Home", href: "/client/home" },
    { name: "Find Lawyers", href: "/client/lawyer" },
    { name: "My Cases", href: "/client/cases" },
    { name: "Post a Case", href: "/client/cases/post" },
    // { name: "Appointments", href: "/client/appointments" },
    { name: "Messages", href: "/client/messages" },
  ];

  const lawyerNavItems = [
    { name: "Home", href: "/lawyer/home" },
    { name: "Cases", href: "/lawyer/all-cases" },
    { name: "Cases On Hand", href: "/lawyer/lawyerCase" },
    { name: "My Bids", href: "/lawyer/my-bids" },
    // { name: "Appointments", href: "/lawyer/appointments" },
    { name: "Messages", href: "/lawyer/messages" },
  ];

  const adminNavItems = [
    { name: "Admin Panel", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Cases", href: "/admin/cases" },
    { name: "Reports", href: "/admin/reports" },
  ];

  const navItems = user
    ? user.role === "Client"
      ? clientNavItems
      : user.role === "Lawyer"
      ? lawyerNavItems
      : adminNavItems
    : [];

  const isActive = (href) => {
    return location.pathname === href
      ? "text-gray-800 font-semibold"
      : "text-gray-800 hover:text-gray-600";
  };

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/Logo.png"
              alt="LegalConnect Ethiopia Logo"
              className="pt-5 h-25 w-40"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative text-base font-medium ${isActive(
                  item.href
                )} flex items-center after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-gray-800 after:transition-all after:duration-300 hover:after:w-full`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Welcome message */}
                <span className="hidden md:block text-gray-800 text-base font-medium">
                  Welcome, {user.username}
                </span>
                {/* Notifications Button */}
                <button
                  onClick={handleNotificationClick}
                  className="relative text-gray-800 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadNotifications}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </button>
                {/* Profile Button */}
                <Link
                  to={
                    user.role === "Lawyer"
                      ? `/lawyer/profile/${user._id}`
                      : user.role === "Client"
                      ? "/client/clientprofile"
                      : "/admin/profile"
                  }
                  className="text-gray-800 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  <User className="h-6 w-6" />
                  <span className="sr-only">Profile</span>
                </Link>
                {/* Logout Button - Desktop */}
                <button
                  onClick={handleLogoutClick}
                  className="text-gray-800 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  <LogOut className="h-6 w-6" />
                  <span className="sr-only">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-800 hover:text-gray-600 text-base font-medium flex items-center"
                >
                  Login
                  <svg
                    className="ml-1 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14"
                    />
                  </svg>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(
                  item.href
                )}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <>
                <div className="px-3 py-2 text-base font-medium text-gray-800">
                  Welcome, {user.username}
                </div>
                <button
                  onClick={() => {
                    handleNotificationClick();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 flex items-center"
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <Link
                  to={
                    user.role === "Lawyer"
                      ? `/lawyer/profile/${user._id}`
                      : user.role === "Client"
                      ? "/client/clientprofile"
                      : "/admin/profile"
                  }
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Try for Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleLogoutCancel}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">
                Confirm Logout
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out? You will need to log in again to access your account.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}















