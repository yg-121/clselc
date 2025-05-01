import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Clock,
  FileText,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function MyBids({ userName }) {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [userId, setUserId] = useState(null);

  // Decode token to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.id) {
        throw new Error("User ID not found in token.");
      }
      setUserId(decoded.id);
      console.log("Decoded userId:", decoded.id);
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Failed to authenticate. Please log in again.");
      setLoading(false);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // Fetch bids from backend
  useEffect(() => {
    if (!userId) return;

    const fetchBids = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
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

        // Map backend bid data to frontend format
        const mappedBids = data.bids.map((bid) => {
          console.log("Mapping bid:", bid);
          return {
            id: bid._id || "unknown-id",
            caseId: bid.case?._id || "N/A",
            caseTitle: bid.case?.description || "Unknown Case",
            clientName: bid.client?.username || "Unknown Client",
            amount: bid.amount || 0,
            submittedDate: bid.submittedDate || new Date().toISOString(),
            expiryDate: bid.expiryDate || new Date().toISOString(),
            status: bid.status || "pending",
            notes: bid.notes || "No notes provided",
            category: bid.case?.category || "Uncategorized",
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

    fetchBids();
  }, [userId]);

  useEffect(() => {
    // Filter bids based on selected status and maintain sorting
    let result = [...bids]; // Create a copy to avoid mutating the original bids array
    if (selectedStatus !== "all") {
      result = result.filter((bid) => bid.status === selectedStatus);
    }
    // Re-sort the filtered results by submittedDate (latest first)
    result.sort(
      (a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)
    );
    setFilteredBids(result);
  }, [selectedStatus, bids]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") {
      return "N/A";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm hover:bg-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200 shadow-sm hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 shadow-sm hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 shadow-sm hover:bg-gray-200";
    }
  };

  const getCardStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-l-4 border-yellow-200 hover:bg-yellow-100";
      case "accepted":
        return "bg-green-50 border-l-4 border-green-200 hover:bg-green-100";
      case "rejected":
        return "bg-red-50 border-l-4 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 border-l-4 border-gray-200 hover:bg-gray-100";
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
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md">
            My Bids
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {filteredBids.length}{" "}
              {selectedStatus === "all" ? "Total" : selectedStatus} Bids
            </h2>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all duration-300 hover:shadow-md"
            >
              <option value="all">All Bids</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bids List */}
        {filteredBids.length > 0 ? (
          <div className="bg-card text-card-foreground shadow-lg rounded-xl overflow-hidden transition-all duration-300">
            <ul className="divide-y divide-gray-200">
              {filteredBids.map((bid) => (
                <li
                  key={bid.id}
                  className={`transition-all duration-300 ${getCardStatusColor(
                    bid.status
                  )}`}
                >
                  <Link to="#" className="block">
                    <div className="px-6 py-5 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-105 transition-all duration-300">
                              <DollarSign className="h-6 w-6 text-primary group-hover:text-blue-600 transition-colors duration-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-italic text-foreground group-hover:text-primary transition-colors duration-300">
                                {bid.caseTitle}
                              </h3>
                              <span
                                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  bid.status
                                )} transition-all duration-300 transform group-hover:scale-105`}
                              >
                                {bid.status.charAt(0).toUpperCase() +
                                  bid.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 flex items-center">
                              <FileText className="mr-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                              Client:{" "}
                              <span className="ml-1 group-hover:text-primary transition-colors duration-300">
                                {bid.clientName}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-600">
                              <DollarSign className="mr-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                              Bid Amount:{" "}
                              <span className="ml-1 font-medium group-hover:text-primary transition-colors duration-300">
                                {formatCurrency(bid.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2 border border-blue-200 shadow-sm hover:bg-blue-200 hover:scale-105 transition-all duration-300">
                            {bid.category}
                          </span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                            Submitted:{" "}
                            <span className="ml-1 group-hover:text-primary transition-colors duration-300">
                              {formatDate(bid.submittedDate)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="mr-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                            Expires:{" "}
                            <span className="ml-1 group-hover:text-primary transition-colors duration-300">
                              {formatDate(bid.expiryDate)}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                        </div>
                      </div>
                      <div className="mt-2 ml-16">
                        <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                          {bid.notes}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No bids found
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedStatus === "all"
                ? "You haven't submitted any bids yet."
                : `You don't have any ${selectedStatus} bids.`}
            </p>
            {selectedStatus !== "all" ? (
              <button
                onClick={() => setSelectedStatus("all")}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transform hover:scale-105 transition-all duration-300 mr-3"
              >
                View All Bids
              </button>
            ) : null}
            <Link
              to="/lawyer/cases/available"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Browse Available Cases
            </Link>
          </div>
        )}

        {/* Bid Status Guide */}
        <div className="mt-8 bg-card text-card-foreground rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10">
          <h3 className="text-lg font-semibold text-foreground mb-4 tracking-tight">
            Bid Status Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
              <Clock className="h-5 w-5 text-yellow-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  Pending
                </p>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  Client is reviewing your bid
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  Accepted
                </p>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  Client has accepted your bid
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group">
              <XCircle className="h-5 w-5 text-red-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                  Rejected
                </p>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  Client has rejected your bid
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
