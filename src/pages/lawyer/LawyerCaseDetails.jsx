import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Tag,
  FileText,
  Send,
  User,
  Eye,
  X,
} from "lucide-react";

// Helper function to map status to color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "posted":
      return "bg-amber-500";
    case "assigned":
      return "bg-blue-500";
    case "closed":
      return "bg-green-600";
    default:
      return "bg-gray-500";
  }
};

// Custom document viewer component for lawyers
const LawyerDocumentViewer = ({ documents, caseId }) => {
  return (
    <div className="relative">
      {documents && documents.length > 0 ? (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-800">
                      {doc.fileName}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()} 
                  </p>
                </div>
                <div>
                  <a
                    href={`http://localhost:5000/${doc.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 hover:scale-105 transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 " />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-center">No documents available.</p>
      )}
    </div>
  );
};

export default function LawyerCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Add state for confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bidDetails, setBidDetails] = useState(null);

  // Add this function to handle navigation with fallback
  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to direct location change if navigate fails
      window.location.href = path;
    }
  };

  useEffect(() => {
    const fetchLawyerCaseDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const res = await fetch(`http://localhost:5000/api/cases/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch case details.");
        }

        const data = await res.json();
        setCaseItem(data.case);
      } catch (err) {
        console.error("Error fetching case details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerCaseDetails();
  }, [id]);

  const toggleDocs = () => {
    setIsDocsOpen(!isDocsOpen);
  };

  // Modified to show confirmation popup first
  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    // Validate input
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setBidError("Please enter a valid bid amount");
      return;
    }
    
    // Set bid details and show confirmation popup
    setBidDetails({
      caseId: id,
      amount: parseFloat(amount),
      comment: comment
    });
    setShowConfirmation(true);
  };

  // Actual submission after confirmation
  const handleConfirmBid = async () => {
    setBidError(null);
    setBidSuccess(null);
    setSubmitting(true);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const res = await fetch("http://localhost:5000/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          case: bidDetails.caseId,
          amount: bidDetails.amount,
          comment: bidDetails.comment,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit bid.");
      }

      setBidSuccess("Bid submitted successfully!");
      setAmount("");
      setComment("");
      
      // Automatically navigate to My Bids page after successful submission
      setTimeout(() => {
        safeNavigate("/lawyer/my-bids");
      }, 2000);
    } catch (err) {
      console.error("Error submitting bid:", err);
      setBidError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
          <p className="text-gray-600 text-lg">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Error Loading Case
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              to="/lawyer/all-cases"
              className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Case Not Found
          </h2>
          <p className="text-gray-600 text-center mb-6">
            The case you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex justify-center">
            <Link
              to="/lawyer/all-cases"
              className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300"
            >
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 text-gray-800 min-h-screen pb-6">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          to="/lawyer/all-cases"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Cases
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Case details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {caseItem.category}
                      </h1>
                      <span
                        className={`ml-3 px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {caseItem.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-1">Deadline:</span>
                    {formatDate(caseItem.deadline)}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-1">Posted:</span>
                    {formatDate(caseItem.createdAt)}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-1">Category:</span>
                    {caseItem.category}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-1">Client:</span>
                    {caseItem.client?.username || "Anonymous"}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" /> Case Documents
                </h2>
                <button
                  onClick={toggleDocs}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {isDocsOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {isDocsOpen && (
                <div className="p-4">
                  {caseItem.documents && caseItem.documents.length > 0 ? (
                    <LawyerDocumentViewer 
                      documents={caseItem.documents} 
                      caseId={id}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-3 text-sm">No documents attached to this case</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Bid form */}
          <div className="lg:col-span-1">
            {/* Submit Bid Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-semibold flex items-center">
                  <DollarSign className="mr-1.5 h-4 w-4 text-primary" /> Submit Your Bid
                </h2>
              </div>
              
              <div className="p-4">
                {bidSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">{bidSuccess}</p>
                    </div>
                  </div>
                )}
                
                {bidError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{bidError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmitForm}>
                  <div className="mb-3">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Amount (ETB)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                        placeholder="Enter your bid amount"
                        className="pl-9 block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Comment (Optional)
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any additional information about your bid"
                      rows="3"
                      className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || bidSuccess}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium shadow-md text-sm
                        ${submitting || bidSuccess 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-primary hover:bg-primary/90 hover:shadow-lg"} 
                        transition-all duration-300`}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-1.5 h-3 w-3" /> Submit Bid
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bid Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Your Bid
              </h2>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Bid Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Case:</div>
                  <div className="font-medium text-gray-800">{caseItem.category}</div>
                  
                  <div className="text-gray-600">Amount:</div>
                  <div className="font-medium text-gray-800">{bidDetails?.amount} ETB</div>
                  
                  {bidDetails?.comment && (
                    <>
                      <div className="text-gray-600">Comment:</div>
                      <div className="font-medium text-gray-800">{bidDetails.comment}</div>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to submit this bid? Once submitted, you cannot modify it.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBid}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
