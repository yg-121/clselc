"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useContext(AuthContext)

  if (!currentUser) {
    // Not logged in
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // User doesn't have the required role
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === "Client") {
      return <Navigate to="/dashboard/client" replace />
    } else if (currentUser.role === "Lawyer") {
      return <Navigate to="/dashboard/lawyer" replace />
    } else if (currentUser.role === "Admin") {
      return <Navigate to="/dashboard/admin" replace />
    } else {
      // Fallback to login if role is unknown
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default ProtectedRoute
