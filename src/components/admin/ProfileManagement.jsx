"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useApi } from "../../hooks/useApi"
import Button from "../common/Button"
import Input from "../common/Input"

export default function ProfileManagement() {
  const { user } = useAuth()
  const { callApi, loading } = useApi()
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [profileError, setProfileError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await callApi(() => fetch("/api/users/admin/profile").then((res) => res.json()))

      if (response?.success && response.data) {
        setProfileData({
          username: response.data.username || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
        })
      } else {
        // Set mock data for development
        setProfileData({
          username: user?.username || "Admin",
          email: user?.email || "admin@example.com",
          phone: "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfileError("Failed to load profile data")

      // Set mock data in case of errors
      setProfileData({
        username: user?.username || "Admin",
        email: user?.email || "admin@example.com",
        phone: "",
      })
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMessage("")
    setProfileError("")

    try {
      const response = await callApi(() =>
        fetch("/api/users/admin/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }).then((res) => res.json()),
      )

      if (response.success) {
        setProfileMessage("Profile updated successfully")
      } else {
        setProfileError(response.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileError("An error occurred while updating profile")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage("")
    setPasswordError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    try {
      const response = await callApi(() =>
        fetch("/api/users/admin/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }).then((res) => res.json()),
      )

      if (response.success) {
        setPasswordMessage("Password updated successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setPasswordError(response.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      setPasswordError("An error occurred while updating password")
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Profile Information</h2>

        {profileMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{profileMessage}</div>
        )}

        {profileError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{profileError}</div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={profileData.username}
            onChange={handleProfileChange}
            required
          />

          <Input
            type="email"
            label="Email"
            name="email"
            value={profileData.email}
            onChange={handleProfileChange}
            required
          />

          <Input label="Phone" name="phone" value={profileData.phone} onChange={handleProfileChange} />

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Change Password</h2>

        {passwordMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{passwordMessage}</div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{passwordError}</div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
          />

          <Input
            type="password"
            label="New Password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
