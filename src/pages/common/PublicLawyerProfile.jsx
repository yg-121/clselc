import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PublicLawyerProfile = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      if (!lawyerId) {
        setError("Invalid lawyer ID");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching lawyer profile for ID:", lawyerId);
        setLoading(true);
        
        // Make a direct API call without authentication
        const response = await axios.get(`http://localhost:5000/api/users/lawyers/${lawyerId}`);
        
        console.log("API Response:", response.data);
        setLawyer(response.data.lawyer);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lawyer profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch lawyer profile");
        setLoading(false);
      }
    };

    fetchLawyerProfile();
  }, [lawyerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Lawyer not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-blue-50 p-8 flex flex-col items-center justify-center">
            <img
              src={lawyer.profile_photo || "/default-avatar.png"}
              alt={lawyer.username}
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <h1 className="text-2xl font-bold mt-4 text-center">{lawyer.username}</h1>
            <p className="text-blue-600 font-medium">
              {lawyer.specialization && lawyer.specialization.join(', ')}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{lawyer.averageRating || "No ratings"}</span>
              <span className="ml-1 text-gray-500">({lawyer.ratingCount || 0})</span>
            </div>
          </div>
          
          <div className="md:w-2/3 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">About</h2>
              <p className="text-gray-600">{lawyer.bio || "No bio available"}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Experience</h2>
              <p className="text-gray-600">{lawyer.yearsOfExperience} years</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Location</h2>
              <p className="text-gray-600">{lawyer.location || "Not specified"}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Hourly Rate</h2>
              <p className="text-gray-600">{lawyer.hourlyRate ? `${lawyer.hourlyRate} ETB` : "Not specified"}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {lawyer.languages && lawyer.languages.length > 0 ? (
                  lawyer.languages.map((language, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No languages listed</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Contact
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => navigate(-1)}
        className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>
    </div>
  );
};

export default PublicLawyerProfile;