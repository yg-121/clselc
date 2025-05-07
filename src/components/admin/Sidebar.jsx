"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { Home, Users, Briefcase, Bell, FileText, Calendar, User, X } from "lucide-react"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"

const AdminSidebar = ({ isOpen, toggleSidebar, notificationCount }) => {
  const location = useLocation()
  const navigate = useNavigate()
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
      badge: notificationCount > 0 ? (
        <Badge variant="destructive" className="ml-auto">
          {notificationCount > 99 ? "99+" : notificationCount}
        </Badge>
      ) : null,
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
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-card text-card-foreground fixed md:sticky top-0 z-30 h-screen transition-all duration-300 ease-in-out ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`font-bold text-xl transition-opacity duration-200 ${isOpen ? "opacity-100" : "md:opacity-0"}`}>
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
                    variant={path === item.path ? "default" : "ghost"}
                    className={`w-full justify-start ${!isOpen && "md:justify-center"}`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className={`${!isOpen && "md:hidden"}`}>{item.name}</span>
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
    </>
  )
}

export default AdminSidebar
