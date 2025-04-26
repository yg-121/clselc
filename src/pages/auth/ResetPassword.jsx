

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    const result = await resetPassword(token, newPassword)
    setIsLoading(false)

    if (result.success) {
      setMessage(result.message)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-navy mb-6">Reset Password</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            label="New Password (min 8 characters)"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-10 text-navy"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        <div className="mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            label="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
      <p className="mt-4 text-center text-navy">
        Remember your password?{" "}
        <Link to="/login" className="text-gold hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default ResetPassword
