
"use client"

import { useState, useEffect, useContext } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { User, Mail, Phone, Lock } from "react-feather"
import api, { handleApiError } from "../../utils/api"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { AuthContext } from "../../context/AuthContext.jsx"
import { toast } from "react-toastify"

const Profile = () => {
  const queryClient = useQueryClient()
  const { user } = useContext(AuthContext)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  // Fetch admin profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      try {
        const response = await api.get("/users/admin/profile")
        return response.data
      } catch (error) {
        handleApiError(error, setError)
        throw error
      }
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData()

      // Add profile data to formData
      Object.keys(data).forEach((key) => {
        if (key !== "profilePhoto" && key !== "profile_photo") {
          formData.append(key, data[key])
        }
      })

      // Add profile photo if exists - use the correct field name "profile_photo"
      if (profileImage) {
        formData.append("profile_photo", profileImage)
      }

      const response = await api.put("/users/admin/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] })
    },
    onError: (error) => {
      console.error("API Error:", error)
      console.error("Error details:", error.response?.data || error.message)
      handleApiError(error, setError)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await api.put("/users/admin/password", data)
        return response.data
      } catch (error) {
        // Extract the specific error message from the response
        if (error.response?.status === 401 && error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        throw error
      }
    },
    onSuccess: () => {
      toast.success("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      })
    },
    onError: (error) => {
      // Display a more user-friendly error message
      if (error.message === "Current password is incorrect") {
        setError("The current password you entered is incorrect. Please try again.")
      } else {
        handleApiError(error, setError)
      }
    },
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
      })

      if (profile.profilePhotoUrl) {
        setPreviewUrl(profile.profilePhotoUrl)
      }
    }
  }, [profile])

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    
    // Create data object with the correct field names
    const data = {
      username: profileData.username,
      email: profileData.email,
      phone: profileData.phone,
      // Don't include profilePhoto here, it will be handled separately in the mutation
    }
    
    updateProfileMutation.mutate(data)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("New passwords do not match")
      return
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }

    // Log the data being sent (for debugging)
    console.log("Sending password change request with data:", {
      currentPassword: "********", // Don't log the actual password
      newPassword: "********", // Don't log the actual password
    })

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Management</h2>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>

            {isLoadingProfile ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading profile...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone (optional)
                    </label>
                    <div className="184mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    <div className="mt-1">
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Profile Preview */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Preview</h3>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4">
                {previewUrl ? (
                  <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>

              <h4 className="text-xl font-medium text-gray-900">
                {profileData.username || user?.username || "Admin User"}
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                {profileData.email || user?.email || "admin@example.com"}
              </p>

              <div className="mt-4 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">Admin</div>

              {profileData.phone && (
                <p className="mt-4 text-sm text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {profileData.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


