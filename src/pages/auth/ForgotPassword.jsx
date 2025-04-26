

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    const result = await forgotPassword(email)

    setIsLoading(false)

    if (result.success) {
      setMessage(result.message)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-navy mb-6">Forgot Password</h2>
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword
