"use client"

import { Bell, Menu, User } from "react-feather"
import { useState, useRef, useEffect } from "react"

const AdminHeader = ({ user, logout, toggleSidebar, notificationCount }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 focus:outline-none focus:text-indigo-600 mr-4"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="/dashboard/admin/notifications"
            className="text-gray-600 hover:text-indigo-600 relative"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </a>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {user.username ? user.username.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user.username}</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="/dashboard/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
