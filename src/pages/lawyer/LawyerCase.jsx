import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  Filter,
  Calendar,
  CheckCircle,
  ChevronDownCircle,
  Search,
  ArrowRight,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function LawyerCase({ userName }) {
  const [cases, setCases] = useState([]);
  const [filteredCase, setFilteredCase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    } catch (err) {
      console.error("Error decoding token:", err);
      setError("Failed to authenticate. Please log in again.");
      setLoading(false);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // Fetch cases from backend
  useEffect(() => {
    if (!userId) return;

    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/cases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch cases.");
        }

        const data = await response.json();

        // Validate cases data
        if (!Array.isArray(data.cases)) {
          throw new Error("Invalid response: cases is not an array.");
        }

        // Filter cases where assigned_lawyer._id matches the lawyer's ID
        const assignedCases = data.cases.filter(
          (caseItem) => caseItem.assigned_lawyer?._id === userId
        );

        setCases(assignedCases);
        setFilteredCase(assignedCases);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [userId]);

  // Helper function to map backend status to frontend status
  const mapStatus = (backendStatus) => {
    switch (backendStatus?.toLowerCase()) {
      case "posted":
        return "started";
      case "assigned":
        return "on progress";
      case "closed":
        return "completed";
      default:
        return "started"; // Default to "started" for unknown statuses
    }
  };

  // Get status color for buttons
  const getStatusButtonColor = (status) => {
    switch (status) {
      case "started":
        return "bg-amber-500 text-white";
      case "on progress":
        return "bg-primary text-primary-foreground";
      case "completed":
        return "bg-green-600 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  // Get status color for badges
  const getStatusBadgeColor = (backendStatus) => {
    const status = mapStatus(backendStatus);
    switch (status) {
      case "started":
        return "bg-amber-500";
      case "on progress":
        return "bg-primary";
      case "completed":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  // Get status icon color
  const getStatusIconColor = (status) => {
    switch (status) {
      case "started":
        return "text-amber-500";
      case "on progress":
        return "text-primary";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  useEffect(() => {
    // Filter cases based on selected status and search term
    let filtered = cases;
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (caseItem) => mapStatus(caseItem.status) === selectedStatus
      );
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (caseItem) => 
          caseItem.category?.toLowerCase().includes(term) || 
          caseItem.description?.toLowerCase().includes(term) ||
          caseItem.client?.username?.toLowerCase().includes(term)
      );
    }
    
    setFilteredCase(filtered);
  }, [selectedStatus, cases, searchTerm]);

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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold">Cases On My Hand</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Section - Horizontal Layout */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-foreground mr-4">
                {filteredCase.length}{" "}
                {selectedStatus === "all" ? "Total" : selectedStatus} Cases
              </h2>

              {/* Status Filter */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedStatus("all")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStatus === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatus("started")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStatus === "started"
                      ? getStatusButtonColor("started")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Started
                </button>
                <button
                  onClick={() => setSelectedStatus("on progress")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStatus === "on progress"
                      ? getStatusButtonColor("on progress")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  On Progress
                </button>
                <button
                  onClick={() => setSelectedStatus("completed")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStatus === "completed"
                      ? getStatusButtonColor("completed")
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Case List - Grid Layout */}
        {filteredCase.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCase.map((caseItem) => (
              <Link
                key={caseItem._id}
                to={`/lawyer/lawyerCase/${caseItem._id}`}
                className="bg-card text-card-foreground rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:scale-[1.02] hover:border hover:border-primary/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {caseItem.category || "Uncategorized"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Client: {caseItem.client?.username || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs text-white rounded-full ${getStatusBadgeColor(
                      caseItem.status
                    )}`}
                  >
                    {mapStatus(caseItem.status)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {caseItem.notes && caseItem.notes.length > 0
                    ? caseItem.notes[0].content
                    : caseItem.description || "No description available."}
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {caseItem.deadline
                      ? new Date(caseItem.deadline).toLocaleDateString()
                      : "No deadline"}
                  </div>
                  <div className="flex items-center text-primary font-medium">
                    View Details <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No cases found
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedStatus === "all"
                ? "You haven't any cases yet."
                : `You don't have any ${selectedStatus} cases.`}
            </p>
          </div>
        )}
        {/* Case Status Guide - Horizontal Layout */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Case Status Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Clock
                className={`h-5 w-5 ${getStatusIconColor(
                  "started"
                )} mr-2 flex-shrink-0`}
              />
              <div>
                <p className="font-medium text-foreground">Started</p>
                <p className="text-sm text-gray-500">
                  The case has just started
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <ChevronDownCircle
                className={`h-5 w-5 ${getStatusIconColor(
                  "on progress"
                )} mr-2 flex-shrink-0`}
              />
              <div>
                <p className="font-medium text-foreground">On Progress</p>
                <p className="text-sm text-gray-500">
                  The case is being worked on
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle
                className={`h-5 w-5 ${getStatusIconColor(
                  "completed"
                )} mr-2 flex-shrink-0`}
              />
              <div>
                <p className="font-medium text-foreground">Completed</p>
                <p className="text-sm text-gray-500">
                  The case has been resolved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
