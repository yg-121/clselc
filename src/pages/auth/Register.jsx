

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../../context/AuthContext"
import Button from "../../components/common/Button"
import Input from "../../components/common/Input"

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Client",
    phone: "",
    specialization: [],
    location: "",
    yearsOfExperience: "",
    bio: "",
    certifications: "",
    hourlyRate: "",
    languages: "",
    license_file: null,
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const specializationOptions = [
    "Criminal Law",
    "Family Law",
    "Corporate Law",
    "Immigration",
    "Personal Injury",
    "Real Estate",
    "Civil law",
    "Marriage law",
    "Intellectual Property",
    "Employment Law",
    "Bankruptcy",
    "Tax Law",
  ]

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  const handleSpecializationChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({ ...prev, specialization: selected }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "specialization" && value.length > 0) {
        value.forEach((spec) => data.append("specialization[]", spec))
      } else if (value && value !== "" && value !== null) {
        data.append(key, value)
      }
    })

    const result = await register(data)

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
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-navy mb-6">Register</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input type="email" label="Email" name="email" value={formData.email} onChange={handleChange} required />
        <div className="relative mb-4">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password (min 8 characters)"
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
        <div className="mb-4">
          <label className="block text-navy mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
            required
          >
            <option value="Client">Client</option>
            <option value="Lawyer">Lawyer</option>
          </select>
        </div>

        {formData.role === "Lawyer" && (
          <>
            <Input type="text" label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <div className="mb-4">
              <label className="block text-navy mb-2">
                Specialization <span className="text-red-500">*</span> (select multiple)
              </label>
              <select
                name="specialization"
                multiple
                value={formData.specialization}
                onChange={handleSpecializationChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                required
              >
                {specializationOptions.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="text"
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <Input
              type="number"
              label="Years of Experience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              required
            />
            <div className="mb-4">
              <label className="block text-navy mb-2">Bio (max 500 characters)</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                rows="4"
                maxLength="500"
              />
            </div>
            <Input
              type="text"
              label="Certifications (comma-separated)"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="e.g., Bar Certified, Mediation"
            />
            <Input
              type="number"
              label="Hourly Rate ($)"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            <Input
              type="text"
              label="Languages (comma-separated)"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="e.g., English, Amharic"
            />
            <div className="mb-4">
              <label className="block text-navy mb-2">
                License File (PDF/JPG/PNG) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="license_file"
                accept=".pdf,.jpg,.png"
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
      <p className="mt-4 text-center text-navy">
        Already have an account?{" "}
        <Link to="/login" className="text-gold hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default Register
