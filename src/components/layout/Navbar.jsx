

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
              <span className="ml-2 text-xl font-bold text-navy">Legal Connect</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="text-navy mr-4">Welcome, {user.username}</span>
                <button onClick={handleLogout} className="text-navy hover:text-gold transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-navy hover:text-gold transition-colors mr-4">
                  Login
                </Link>
                <Link to="/register" className="text-navy hover:text-gold transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
