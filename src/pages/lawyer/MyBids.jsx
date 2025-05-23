import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  User,
  Award,
} from "lucide-react";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [userId, setUserId] = useState(null);
  
  // Add state for the popup
  const [selectedBid, setSelectedBid] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Function to open the popup
  const openBidDetails = (bid) => {
    setSelectedBid(bid);
    setShowPopup(true);
  };

  // Function to close the popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedBid(null);
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "border-green-200 bg-green-50 text-green-700";
      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";
      case "pending":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  // Add a refresh function to the MyBids component
  const refreshBids = () => {
    fetchBids();
  };

  useEffect(() => {
    // Get user ID from localStorage
    const userData = localStorage.getItem("user");
    let parsedUserId = null;
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser._id) {
          setUserId(parsedUser._id);
          parsedUserId = parsedUser._id;
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
        // Continue with the fetch even if we can't parse the user data
      }
    }

    fetchBids();
  }, []);  // Remove userId dependency to avoid refetching issues

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch("http://localhost:5000/api/bids/my-bids", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to fetch bids.");
      }

      const data = await response.json();
      console.log("API response:", data);

      // Validate bids data
      if (!Array.isArray(data.bids)) {
        throw new Error("Invalid response: bids is not an array.");
      }

      // Map the bids to a more usable format with null/undefined checks
      const mappedBids = data.bids.map((bid) => {
        // Ensure bid and case exist
        if (!bid || !bid.case) {
          return {
            id: bid?._id || "unknown",
            caseId: "unknown",
            caseTitle: "Unknown Case",
            caseDescription: "No description available",
            amount: bid?.amount || 0,
            comment: bid?.comment || "",
            status: bid?.status || "Pending",
            submittedDate: bid?.createdAt || new Date().toISOString(),
            deadline: "Not specified",
            clientName: "Unknown Client",
          };
        }
        
        return {
          id: bid._id || "unknown",
          caseId: bid.case._id || "unknown",
          caseTitle: bid.case.category || "Unknown Case",
          caseDescription: bid.case.description || "No description available",
          amount: bid.amount || 0,
          comment: bid.comment || "",
          status: bid.status || "Pending",
          submittedDate: bid.createdAt || new Date().toISOString(),
          deadline: bid.case.deadline || "Not specified",
          clientName: bid.case.client?.username || "Anonymous",
        };
      });

      // Sort bids by submittedDate in descending order (latest first)
      mappedBids.sort(
        (a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)
      );

      console.log("Mapped and sorted bids:", mappedBids);
      setBids(mappedBids);
      setFilteredBids(mappedBids);
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError(err.message);
      if (err.message.includes("log in")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort bids when search term, status filter, or sort order changes
  useEffect(() => {
    let result = [...bids];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (bid) =>
          bid.caseTitle.toLowerCase().includes(lowerCaseSearchTerm) ||
          bid.caseDescription.toLowerCase().includes(lowerCaseSearchTerm) ||
          bid.clientName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (bid) => bid.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sort order
    if (sortOrder === "newest") {
      result.sort(
        (a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)
      );
    } else if (sortOrder === "oldest") {
      result.sort(
        (a, b) => new Date(a.submittedDate) - new Date(b.submittedDate)
      );
    } else if (sortOrder === "highest") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortOrder === "lowest") {
      result.sort((a, b) => a.amount - b.amount);
    }

    setFilteredBids(result);
  }, [bids, searchTerm, statusFilter, sortOrder]);

  // Format date with better error handling
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Not specified") return "Not specified";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            {error.includes("log in") && (
              <Link
                to="/login"
                className="mt-2 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
              >
                Go to login page
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Bids</h1>
         
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by case title, description, or client name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:scale-[1.02] hover:border hover:border-primary/30"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {bid.caseTitle}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                        bid.status
                      )}`}
                    >
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {bid.caseDescription}
                  </p>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium text-foreground">
                      {bid.amount} ETB
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Bid: {formatDate(bid.submittedDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Deadline: {formatDate(bid.deadline)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Client: {bid.clientName}
                    </div>
                    <button
                      onClick={() => openBidDetails(bid)}
                      className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Info className="h-3 w-3 mr-1" /> Bid Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              {searchTerm || statusFilter !== "all" ? (
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              ) : (
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No matching bids found"
                : "No bids yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search filters to find what you're looking for."
                : "You haven't placed any bids on cases yet."}
            </p>
            {!searchTerm && statusFilter === "all" ? (
              <Link
                to="/lawyer/cases/available"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
              >
                Browse Available Cases
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {/* Bid Details Popup */}
      {showPopup && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                {getStatusIcon(selectedBid.status)}
                <span className="ml-2">Bid Details</span>
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-medium text-gray-900">Case Information</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                      selectedBid.status
                    )}`}
                  >
                    {selectedBid.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{selectedBid.caseTitle}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedBid.caseDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500">Bid Amount</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 text-primary mr-1" />
                    {selectedBid.amount} ETB
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bid Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedBid.submittedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedBid.clientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Case Deadline</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedBid.deadline)}
                  </p>
                </div>
              </div>
              
              {selectedBid.comment && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-1">Your Comment</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedBid.comment}
                  </p>
                </div>
              )}
              
              {selectedBid.status === "Accepted" && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                  <Award className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Congratulations! Your bid was accepted.
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      You have been assigned to this case. You can now proceed with handling the case.
                    </p>
                  </div>
                </div>
              )}
              
              {selectedBid.status === "Rejected" && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Your bid was not selected.
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      The client has chosen another lawyer for this case.
                    </p>
                  </div>
                </div>
              )}
              
              {selectedBid.status === "Pending" && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start">
                  <Clock className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Your bid is awaiting client decision.
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      The client has not yet made a decision on this case.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between rounded-b-lg">
              <button
                onClick={closePopup}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
