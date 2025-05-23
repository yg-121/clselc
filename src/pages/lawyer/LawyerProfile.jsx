import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authHooks.js";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Globe,
  Award,
  FileText,
  Edit3,
  Save,
  X,
  XCircle,
  CheckCircle,
  Star,
} from "lucide-react";

// Add custom styles
const customStyles = {
  multiSelect: {
    option: {
      padding: "8px 12px",
      borderBottom: "1px solid #f0f0f0",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    optionSelected: {
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      color: "#4F46E5",
      fontWeight: "500",
    },
    optionHover: {
      backgroundColor: "rgba(79, 70, 229, 0.05)",
    },
    tag: {
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "rgba(79, 70, 229, 0.1)",
      color: "#4F46E5",
      fontSize: "0.75rem",
      borderRadius: "9999px",
      padding: "0.25rem 0.5rem",
      margin: "0.25rem",
    },
    tagRemove: {
      marginLeft: "0.25rem",
      cursor: "pointer",
      color: "#4F46E5",
      transition: "opacity 0.2s ease",
    },
  },
};

export default function LawyerProfile() {
  const { user: authUser } = useAuth();
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    specialization: "",
    location: "",
    yearsOfExperience: "",
    bio: "",
    certifications: "",
    hourlyRate: "",
    languages: "",
    isAvailable: false,
    profilePhoto: null,
    status: "", // Added to preserve status
    verificationStatus: "", // Added to preserve verificationStatus
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const validSpecializations = [
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
  ];
  const [successMessage, setSuccessMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Handle specialization change
  const handleSpecializationChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedSpecializations(selected);
  };

  // Toggle individual specializations
  const toggleSpecialization = (spec) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(
        selectedSpecializations.filter((s) => s !== spec)
      );
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  // Fetch lawyer profile
  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const response = await fetch(
          `http://localhost:5000/api/users/lawyers/${lawyerId || "me"}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lawyer profile");
        }

        const data = await response.json();
        const mergedData = {
          ...data.lawyer,
          email: authUser?.email || data.lawyer.email,
        };

        setLawyerData(mergedData);

        if (Array.isArray(mergedData.specialization)) {
          setSelectedSpecializations(mergedData.specialization);
        }

        setFormData({
          username: mergedData.username || "",
          email: mergedData.email || "",
          specialization: Array.isArray(mergedData.specialization)
            ? mergedData.specialization.join(", ")
            : mergedData.specialization || "",
          location: mergedData.location || "",
          yearsOfExperience: mergedData.yearsOfExperience || "",
          bio: mergedData.bio || "",
          certifications: Array.isArray(mergedData.certifications)
            ? mergedData.certifications.join(", ")
            : mergedData.certifications || "",
          hourlyRate: mergedData.hourlyRate || "",
          languages: Array.isArray(mergedData.languages)
            ? mergedData.languages.join(", ")
            : mergedData.languages || "",
          isAvailable: mergedData.isAvailable || false,
          profilePhoto: null,
          status: mergedData.status || "Active", // Preserve status
          verificationStatus: mergedData.verificationStatus || "Verified", // Preserve verificationStatus
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerProfile();
  }, [lawyerId, authUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setPendingApproval(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const data = new FormData();

      // Add selected specializations
      if (selectedSpecializations.length > 0) {
        selectedSpecializations.forEach((spec) => {
          data.append("specialization", spec);
        });
      }

      // Add all form fields, including status and verificationStatus
      Object.keys(formData).forEach((key) => {
        if (key === "profilePhoto" && formData.profilePhoto) {
          data.append(key, formData.profilePhoto);
        } else if (
          key !== "specialization" && // Skip specialization as handled separately
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          data.append(key, formData[key]);
        }
      });

      // Check if there are any fields to update
      const hasUpdates = Array.from(data.entries()).length > 0;
      if (!hasUpdates) {
        setSuccessMessage("No changes to update");
        setEditMode(false);
        setTimeout(() => setSuccessMessage(""), 3000);
        return;
      }

      // Warn about email changes
      if (formData.email !== (lawyerData.email || "")) {
        setSuccessMessage(
          "Email update requires admin verification. Your account may be pending approval."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/users/lawyer/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const responseData = await response.json();
      setLawyerData(responseData.lawyer);

      // Check if status or verificationStatus changed to Pending
      if (
        responseData.lawyer.status === "Pending" ||
        responseData.lawyer.verificationStatus === "Pending"
      ) {
        setPendingApproval(true);
        setSuccessMessage(
          "Profile updated successfully. Your account is pending admin approval."
        );
        // Redirect to login after a delay
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, 5000);
      } else {
        setSuccessMessage("Profile updated successfully");
      }

      setEditMode(false);
      setPreviewImage(null);
      setImageError(false);
      setTimeout(() => {
        setSuccessMessage("");
        setPendingApproval(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
      if (
        err.message.includes("Unauthorized") ||
        err.message.includes("Authentication")
      ) {
        setPendingApproval(true);
        setError("Your account status may be pending. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, 3000);
      }
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setPreviewImage(null);
      setImageError(false);
      setFormData({
        username: lawyerData.username || "",
        email: lawyerData.email || "",
        specialization: Array.isArray(lawyerData.specialization)
          ? lawyerData.specialization.join(", ")
          : lawyerData.specialization || "",
        location: lawyerData.location || "",
        yearsOfExperience: lawyerData.yearsOfExperience || "",
        bio: lawyerData.bio || "",
        certifications: Array.isArray(lawyerData.certifications)
          ? lawyerData.certifications.join(", ")
          : lawyerData.certifications || "",
        hourlyRate: lawyerData.hourlyRate || "",
        languages: Array.isArray(lawyerData.languages)
          ? lawyerData.languages.join(", ")
          : lawyerData.languages || "",
        isAvailable: lawyerData.isAvailable || false,
        profilePhoto: null,
        status: lawyerData.status || "Active",
        verificationStatus: lawyerData.verificationStatus || "Verified",
      });
    } else {
      setEditMode(true);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(
        "http://localhost:5000/api/users/lawyer/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-red-700">{error}</p>
        <Link
          to="/lawyers"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Back to Lawyers List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Success or pending approval message */}
      {(successMessage || pendingApproval) && (
        <div
          className={`mb-4 p-3 border rounded-lg flex items-center ${
            pendingApproval
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <CheckCircle
            className={`h-5 w-5 mr-2 ${
              pendingApproval ? "text-yellow-500" : "text-green-500"
            }`}
          />
          <p className={pendingApproval ? "text-yellow-700" : "text-green-700"}>
            {successMessage}
          </p>
        </div>
      )}

      {/* Edit/Save buttons */}
      <div className="flex justify-end mb-4">
        {editMode ? (
          <div className="flex space-x-2">
            <button
              onClick={handleUpdateProfile}
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
                <label
                  htmlFor="profilePhoto"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer shadow-lg"
                >
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
                  (lawyerData.profile_photo && !imageError
                    ? `http://localhost:5000/Uploads/profiles/${lawyerData.profile_photo}`
                    : "https://placehold.co/150x150")
                }
                alt={lawyerData.username}
                className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
                onError={handleImageError}
              />
            </div>
            <h1 className="text-2xl font-bold mt-4 text-center">
              {lawyerData.username}
            </h1>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (lawyerData.averageRating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {lawyerData.averageRating
                  ? lawyerData.averageRating.toFixed(1)
                  : "0"}
                ({lawyerData.ratingCount || 0})
              </span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {Array.isArray(lawyerData.specialization) &&
                lawyerData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {spec}
                  </span>
                ))}
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lawyerData.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {lawyerData.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Profile details section */}
          <div className="md:w-2/3 p-6">
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "about"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("professional")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "professional"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Professional
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "contact"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "security"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Security
              </button>
            </div>

            {/* Tab content */}
            <div className="mt-4">
              {/* About tab */}
              {activeTab === "about" && (
                <div>
                  {!editMode ? (
                    <>
                      <p className="text-gray-700 mb-4">
                        {lawyerData.bio || "No bio information provided."}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">
                            {lawyerData.yearsOfExperience || "0"} years
                            experience
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">
                            {lawyerData.location || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">
                            ${lawyerData.hourlyRate || "0"}/hour
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">
                            {Array.isArray(lawyerData.languages)
                              ? lawyerData.languages.join(", ")
                              : lawyerData.languages || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Tell clients about yourself..."
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience (years)
                          </label>
                          <input
                            type="number"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Languages
                          </label>
                          <input
                            type="text"
                            name="languages"
                            value={formData.languages}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="English, Spanish, French"
                          />
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Professional tab */}
              {activeTab === "professional" && (
                <div>
                  {!editMode ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-primary" />
                          Specializations
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(lawyerData.specialization) &&
                          lawyerData.specialization.length > 0 ? (
                            lawyerData.specialization.map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No specializations listed
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(lawyerData.certifications) &&
                          lawyerData.certifications.length > 0 ? (
                            lawyerData.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {cert}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No certifications listed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specializations
                        </label>
                        <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-md p-3 bg-white">
                          {validSpecializations.map((spec) => (
                            <div key={spec} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`spec-${spec}`}
                                checked={selectedSpecializations.includes(spec)}
                                onChange={() => {
                                  if (selectedSpecializations.includes(spec)) {
                                    setSelectedSpecializations(
                                      selectedSpecializations.filter(
                                        (s) => s !== spec
                                      )
                                    );
                                  } else {
                                    setSelectedSpecializations([
                                      ...selectedSpecializations,
                                      spec,
                                    ]);
                                  }
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`spec-${spec}`}
                                className="ml-2 text-sm text-gray-700"
                              >
                                {spec}
                              </label>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Selected specializations:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedSpecializations.length > 0 ? (
                              selectedSpecializations.map((spec, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                >
                                  {spec}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">
                                No specializations selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certifications
                        </label>
                        <input
                          type="text"
                          name="certifications"
                          value={formData.certifications}
                          onChange={handleInputChange}
                          placeholder="Bar Association, Legal Certification"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isAvailable"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Available for new cases
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact tab */}
              {activeTab === "contact" && (
                <div>
                  {!editMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">
                          {lawyerData.email ||
                            authUser?.email ||
                            "Email not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">
                          {lawyerData.username || "Username not provided"}
                        </span>
                      </div>
                      {lawyerData.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm">{lawyerData.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Note: Changing your email will require admin
                          verification
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Security tab */}
              {activeTab === "security" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>
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
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        required
                        minLength={8}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
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
