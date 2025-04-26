

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { email, password } = formData
    const result = await login(email, password)

    setIsLoading(false)

    if (result.success) {
      const { role } = result.user
      if (role === "Client") {
        navigate("/dashboard/client")
      } else if (role === "Lawyer") {
        navigate("/dashboard/lawyer")
      } else if (role === "Admin") {
        navigate("/admin")
      }
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-navy mb-6">Login</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input type="email" label="Email" name="email" value={formData.email} onChange={handleChange} required />
        <div className="relative mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-4 text-center text-navy">
        <Link to="/forgot-password" className="text-gold hover:underline">
          Forgot Password?
        </Link>
      </div>
      <p className="mt-4 text-center text-navy">
        Don't have an account?{" "}
        <Link to="/register" className="text-gold hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}

export default Login
