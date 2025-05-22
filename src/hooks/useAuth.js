
import { useAuth } from "../context/AuthContext.jsx"

export const Auth = () => {
  const context = (useAuth)

  if (context === undefined) {
    throw new Error("Auth must be used within an AuthProvider")
  }

  return context
}

export default useAuth
