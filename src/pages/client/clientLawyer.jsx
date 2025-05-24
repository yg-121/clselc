import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function ClientLawyerProfile() {
  const { lawyerId } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required. Please log in.");

        const response = await axios.get(
          `http://localhost:5000/api/users/lawyers/${lawyerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Lawyer data:", response.data.lawyer); // Debug log
        setLawyer(response.data.lawyer);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lawyer profile:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load lawyer profile"
        );
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    if (lawyerId) fetchLawyerProfile();
  }, [lawyerId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="max-w-3xl mx-auto mt-6 p-5 bg-red-50 rounded-lg text-center">
        <p className="text-red-600 mb-3 text-lg">
          {error || "Lawyer not found"}
        </p>
        <Link
          to="/client/lawyer"
          className="text-primary hover:underline text-base"
        >
          Back to Lawyers List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-5">
      {/* Header with Left-aligned Profile */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
          <div className="flex items-center">
            <img
              src={
                lawyer.profile_photo 
                  ? lawyer.profile_photo.includes('/')
                    ? `http://localhost:5000/${lawyer.profile_photo}`
                    : `http://localhost:5000/uploads/${lawyer.profile_photo}`
                  : "https://via.placeholder.com/150"
              }
              alt={lawyer.username}
              className="h-20 w-20 rounded-full object-cover border-2 border-white mr-5"
              onError={(e) => {
                console.log("Image failed to load:", e.target.src);
                // Try alternative paths as fallback
                if (e.target.src.includes('/uploads/')) {
                  e.target.src = `http://localhost:5000/Uploads/${lawyer.profile_photo}`;
                } else if (e.target.src.includes('/Uploads/')) {
                  e.target.src = `http://localhost:5000/uploads/${lawyer.profile_photo}`;
                } else {
                  e.target.src = "https://via.placeholder.com/150";
                }
              }}
            />
            <div>
              <h1 className="text-2xl font-bold mb-1">{lawyer.username}</h1>
              <div className="flex items-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= (lawyer.averageRating || 0)
                        ? "text-yellow-300 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
                <span className="ml-2 text-sm">
                  {lawyer.averageRating?.toFixed(1) || "0.0"} (
                  {lawyer.ratingCount || 0} reviews)
                </span>
              </div>
              <p className="text-gray-200 text-base">
                {Array.isArray(lawyer.specialization)
                  ? lawyer.specialization.join(", ")
                  : "Legal Professional"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Contact Information
            </h2>

            <div className="space-y-4 text-base">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">
                    {lawyer.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-800">
                    {lawyer.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-800">
                    {lawyer.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p
                    className={
                      lawyer.isAvailable
                        ? "text-green-600 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {lawyer.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate(`/client/messages/${lawyerId}`)}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Lawyer
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Professional Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <div>
                <h3 className="text-base font-medium mb-2">About</h3>
                <p className="text-gray-700 mb-4 max-h-32 overflow-y-auto">
                  {lawyer.bio || "No bio information provided."}
                </p>

                <h3 className="text-base font-medium mb-2">Experience</h3>
                <div className="flex items-center mb-4">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {lawyer.yearsOfExperience
                      ? `${lawyer.yearsOfExperience} years`
                      : "Not provided"}
                  </span>
                </div>

                <h3 className="text-base font-medium mb-2">Education</h3>
                <p className="text-gray-700 max-h-24 overflow-y-auto">
                  {lawyer.education || "Not provided."}
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto">
                  {Array.isArray(lawyer.specialization) &&
                  lawyer.specialization.length > 0 ? (
                    lawyer.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">None listed</p>
                  )}
                </div>

                <h3 className="text-base font-medium mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {Array.isArray(lawyer.languages) &&
                  lawyer.languages.length > 0 ? (
                    lawyer.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">None listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold">Client Reviews</h2>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-2 text-base font-medium">
                  {lawyer.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>

            {lawyer.ratingCount > 0 ? (
              <p className="text-gray-700">
                This lawyer has received {lawyer.ratingCount} reviews from
                clients.
              </p>
            ) : (
              <div className="text-center py-6">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-base">No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

