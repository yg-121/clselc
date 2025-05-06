"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Users, Briefcase, Bell, FileText, Calendar, User, X } from "react-feather"

const AdminSidebar = ({ isOpen, toggleSidebar, notificationCount }) => {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard/admin",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Users",
      path: "/dashboard/admin/users",
      icon: <Users className="w-5 h-5" />,
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
      name: "Appointments",
      path: "/dashboard/admin/appointments",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Profile",
      path: "/dashboard/admin/profile",
      icon: <User className="w-5 h-5" />,
    },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white w-64 fixed md:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:w-64 md:flex md:flex-col md:min-h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Legal Admin</h1>
          <button onClick={toggleSidebar} className="md:hidden text-white" aria-label="Close sidebar">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm ${
                    path === item.path ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-700"
                  } rounded-md mx-2 group transition-colors duration-200`}
                  aria-current={path === item.path ? "page" : undefined}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default AdminSidebar
