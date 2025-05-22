import React, { useState, useEffect } from "react";
import { Star, User, Calendar } from "lucide-react";

const LawyerRatings = ({ lawyerId }) => {
  const [ratingsData, setRatingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyerRatings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/ratings/${lawyerId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch lawyer ratings");
        }
        
        const data = await response.json();
        setRatingsData(data);
      } catch (err) {
        console.error("Error fetching lawyer ratings:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (lawyerId) {
      fetchLawyerRatings();
    }
  }, [lawyerId]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
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

  if (!ratingsData || ratingsData.ratings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Client Reviews</h2>
        <p className="text-gray-500 text-center py-6">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Client Reviews</h2>
      
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 ${
                star <= ratingsData.averageRating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <div>
          <span className="text-2xl font-bold">{ratingsData.averageRating.toFixed(1)}</span>
          <span className="text-gray-500 ml-1">
            ({ratingsData.ratingCount} {ratingsData.ratingCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {ratingsData.ratings.map((rating) => (
          <div key={rating._id} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">{rating.client.username}</span>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {rating.comment && (
              <p className="text-gray-700 mb-2">{rating.comment}</p>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(rating.createdAt)}</span>
              {rating.case && (
                <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  Case: {rating.case.description?.substring(0, 20)}
                  {rating.case.description?.length > 20 ? "..." : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawyerRatings;
