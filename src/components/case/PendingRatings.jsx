import React, { useState, useEffect } from "react";
import { Star, AlertCircle } from "lucide-react";
import RatingModal from "./RatingModal";
import { toast } from "react-toastify";

const PendingRatings = () => {
  const [pendingRatings, setPendingRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const fetchPendingRatings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const response = await fetch("http://localhost:5000/api/ratings/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch pending ratings");
      }

      const data = await response.json();
      setPendingRatings(data);
    } catch (err) {
      console.error("Error fetching pending ratings:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRatings();
  }, []);

  const handleRateNow = (rating) => {
    setSelectedRating(rating);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = () => {
    fetchPendingRatings();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-4">
        {error}
      </div>
    );
  }

  if (pendingRatings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Pending Ratings
        </h3>
        
        <div className="space-y-3">
          {pendingRatings.map((rating) => (
            <div 
              key={rating._id} 
              className="bg-white border border-blue-100 rounded-md p-3 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    {rating.case.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lawyer: {rating.lawyer.username}
                  </p>
                </div>
                <button
                  onClick={() => handleRateNow(rating)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Rate Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedRating(null);
          }}
          caseId={selectedRating.case._id}
          lawyerName={selectedRating.lawyer.username}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default PendingRatings;

