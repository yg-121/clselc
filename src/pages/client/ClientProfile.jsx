import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/authHooks.js";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  CheckCircle,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";

export default function ClientProfile() {
  const { user: authUser } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
    firstName: "",
    lastName: "",
    profilePhoto: null,
  });
  
  // Add password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // Add state for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");
        
        const response = await fetch(`http://localhost:5000/api/users/client/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch client profile");
        }
        
        const data = await response.json();
        const clientData = data.client || data.user || {};
        
        setClientData(clientData);
        setFormData({
          username: clientData.username || "",
          email: clientData.email || "",
          phone: clientData.phone || "",
          location: clientData.location || "",
          firstName: clientData.firstName || "",
          lastName: clientData.lastName || "",
          profilePhoto: null,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      const formDataObj = new FormData();
      
      // Only include fields that have changed
      if (formData.username !== clientData.username) {
        formDataObj.append("username", formData.username);
      }
      if (formData.email !== clientData.email) {
        formDataObj.append("email", formData.email);
      }
      if (formData.phone !== clientData.phone) {
        formDataObj.append("phone", formData.phone);
      }
      if (formData.location !== clientData.location) {
        formDataObj.append("location", formData.location);
      }
      if (formData.firstName !== clientData.firstName) {
        formDataObj.append("firstName", formData.firstName);
      }
      if (formData.lastName !== clientData.lastName) {
        formDataObj.append("lastName", formData.lastName);
      }
      
      if (formData.profilePhoto) {
        formDataObj.append("profile_photo", formData.profilePhoto);
      }
      
      console.log("Sending form data:", Object.fromEntries(formDataObj.entries()));
      
      const response = await fetch("http://localhost:5000/api/users/client/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataObj
      });
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to update profile");
        }
        
        setClientData(data.user);
        setSuccessMessage("Profile updated successfully");
        setEditMode(false);
        setPreviewImage(null);
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. Please try again later.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Password update function
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");
      
      const response = await fetch("http://localhost:5000/api/users/client/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }
      
      setPasswordSuccess("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Cancel edit mode
      setEditMode(false);
      setPreviewImage(null);
      // Reset form data to current client data
      setFormData({
        username: clientData.username || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        location: clientData.location || "",
        profilePhoto: null,
      });
    } else {
      // Enter edit mode
      setEditMode(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !clientData) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Edit/Save buttons */}
      <div className="flex justify-end mb-4">
        {editMode ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={updateLoading}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={toggleEditMode}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={toggleEditMode}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile header with compact layout */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="md:flex">
          {/* Profile image section */}
          <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center">
            <div className="relative">
              {editMode && (
                <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <Edit3 className="h-4 w-4" />
                  <input
                    type="file"
                    id="profilePhoto"
                    name="profilePhoto"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              )}
              <img
                src={
                  previewImage ||
                  (clientData?.profile_photo
                    ? `http://localhost:5000/${clientData.profile_photo}`
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em' font-family='Arial' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E")
                }
                alt={clientData?.username || "Client"}
                className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <h2 className="text-xl font-semibold mt-4">{clientData?.username || "Client"}</h2>
            <p className="text-sm text-gray-500">Client</p>
            
            {!editMode && clientData?.createdAt && (
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {new Date(clientData.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Profile details section */}
          <div className="md:w-2/3 p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "about"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "security"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>

            {/* Tab content */}
            <div className="py-2">
              {/* About tab */}
              {activeTab === "about" && (
                <div>
                  {!editMode ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-700">{clientData?.email || "Not provided"}</p>
                        </div>
                      </div>
                      
                      {clientData?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-700">{clientData.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {clientData?.location && (
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-gray-700">{clientData.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Note: Changing your email will require verification
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security tab */}
              {activeTab === "security" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-700">{passwordSuccess}</p>
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700">{passwordError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
































