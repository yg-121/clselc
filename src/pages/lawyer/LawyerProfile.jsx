import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Star,
  MessageSquare,
  Globe,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function LawyerProfile() {
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lawyerId } = useParams();
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
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      if (!lawyerId) {
        setError("Invalid lawyer ID. Please check the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/api/users/lawyers/${lawyerId}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Server Error" }));
          if (response.status === 404) {
            throw new Error(errorData.message || "Lawyer not found");
          }
          throw new Error(
            errorData.message ||
              `Failed to fetch lawyer profile (Status: ${response.status})`
          );
        }

        const data = await response.json();
        setLawyerData(data.lawyer);
        setFormData({
          username: data.lawyer.username || "",
          email: data.lawyer.email || "",
          specialization: Array.isArray(data.lawyer.specialization)
            ? data.lawyer.specialization.join(", ")
            : data.lawyer.specialization || "",
          location: data.lawyer.location || "",
          yearsOfExperience: data.lawyer.yearsOfExperience || "",
          bio: data.lawyer.bio || "",
          certifications: Array.isArray(data.lawyer.certifications)
            ? data.lawyer.certifications.join(", ")
            : data.lawyer.certifications || "",
          hourlyRate: data.lawyer.hourlyRate || "",
          languages: Array.isArray(data.lawyer.languages)
            ? data.lawyer.languages.join(", ")
            : data.lawyer.languages || "",
          isAvailable: data.lawyer.isAvailable || false,
          profilePhoto: null,
        });
      } catch (err) {
        console.error("Error fetching lawyer profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerProfile();
  }, [lawyerId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      return;
    }

    const data = new FormData();

    // Helper to compare arrays after trimming
    const arraysEqual = (arr1, arr2) => {
      if (arr1.length !== arr2.length) return false;
      const sorted1 = [...arr1].sort();
      const sorted2 = [...arr2].sort();
      return sorted1.every((val, idx) => val === sorted2[idx]);
    };

    // Process each field and only append if changed
    Object.keys(formData).forEach((key) => {
      if (
        key === "specialization" ||
        key === "certifications" ||
        key === "languages"
      ) {
        const formValues = formData[key]
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        const originalValues = Array.isArray(lawyerData[key])
          ? lawyerData[key]
          : (lawyerData[key] || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);

        if (formValues.length > 0 && !arraysEqual(formValues, originalValues)) {
          data.append(key, formValues);
        }
      } else if (key === "profilePhoto" && formData.profilePhoto) {
        data.append(key, formData.profilePhoto);
      } else if (key === "email") {
        if (formData.email && formData.email !== (lawyerData.email || "")) {
          data.append(key, formData.email);
        }
      } else if (
        formData[key] !== null &&
        formData[key] !== "" &&
        key !== "status" &&
        formData[key].toString() !== (lawyerData[key] || "").toString()
      ) {
        data.append(key, formData[key]);
      }

      console.log("Adonany", key, formData[key]);
    });

    // Check if there are any fields to update
    const hasUpdates = Array.from(data.entries()).length > 0;
    if (!hasUpdates) {
      setSuccessMessage("No changes to update");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/lawyer/profile`,
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
        throw new Error(
          errorData.message || `Update failed (Status: ${response.status})`
        );
      }

      const result = await response.json();
      setLawyerData(result.user);
      setSuccessMessage("Lawyer profile updated successfully");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-16 text-red-600">
        <p className="text-xl font-semibold">{error}</p>
        <Link
          to="/lawyers"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to Lawyers List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src={lawyerData.profile_photo || "https://via.placeholder.com/150"}
            alt={lawyerData.username}
            className="h-32 w-32 mx-auto rounded-full border-4 border-white shadow-lg mb-4"
          />
          <h1 className="text-4xl font-extrabold mb-2">
            {lawyerData.username}
          </h1>
          <p className="text-lg text-gray-200 mb-4">
            Specialization : {lawyerData.specialization.join(", ")}
          </p>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-6 w-6 text-yellow-300" />
            <span className="text-xl font-semibold">
              {lawyerData.averageRating.toFixed(1)}/5
            </span>
            <span className="text-gray-300">
              ({lawyerData.ratingCount} reviews)
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {lawyerData.isAvailable ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <span className="text-lg font-medium">
              {lawyerData.isAvailable ? "I am Available" : "Not Available"}
            </span>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="mt-6 inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Edit Profile
          </button>
          {successMessage && (
            <p className="mt-4 text-green-600 font-medium">{successMessage}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                About Me
              </h2>
              {!editMode ? (
                <>
                  <p className="text-gray-600 mb-4">Bio : {lawyerData.bio}</p>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">
                        Experience: {lawyerData.yearsOfExperience} years
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">
                        Location: {lawyerData.location}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">
                        Hourly Rate: ${lawyerData.hourlyRate}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">
                        Languages: {lawyerData.languages.join(", ")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleUpdateProfile}
                  encType="multipart/form-data"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Specialization (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Certifications (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hourly Rate
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Languages (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Available
                      </label>
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        name="profilePhoto"
                        onChange={handleInputChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="mt-2 w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Professional Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Professional Details
              </h2>
              {!editMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-gray-600">
                    <p className="font-medium">
                      Certifications: {lawyerData.certifications.join(", ")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
