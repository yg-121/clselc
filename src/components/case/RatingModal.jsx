import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "react-toastify";

const RatingModal = ({ isOpen, onClose, caseId, lawyerName, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit rating");
      }

      await response.json();
      toast.success("Rating submitted successfully");
      
      if (onRatingSubmit) {
        onRatingSubmit();
      }
      
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please log in.");

      const response = await fetch("http://localhost:5000/api/ratings/dismiss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to dismiss rating");
      }

      await response.json();
      onClose();
    } catch (err) {
      console.error("Error dismissing rating:", err);
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Rate Your Experience
          </h3>
          <p className="text-gray-600">
            How was your experience working with {lawyerName}?
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-10 w-10 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                } transition-colors duration-150`}
              />
            </button>
          ))}
        </div>

        {/* Rating Description */}
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-700">
            {rating === 1 && "Poor - Unsatisfactory experience"}
            {rating === 2 && "Fair - Below average experience"}
            {rating === 3 && "Good - Average experience"}
            {rating === 4 && "Very Good - Above average experience"}
            {rating === 5 && "Excellent - Outstanding experience"}
            {rating === 0 && "Select a rating"}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Comments (Optional)
          </label>
          <textarea
            id="comment"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          ></textarea>
          <p className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Remind Me Later
          </button>
          <button
            onClick={handleSubmitRating}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
