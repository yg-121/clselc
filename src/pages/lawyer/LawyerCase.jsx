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
  ChevronRight,
  ChevronDownCircle,
} from "lucide-react";

export default function LawyerCase({ userName }) {
  const [cases, setCases] = useState([]);
  const [filteredCase, setFilteredCase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Use valid ObjectIds (replace these with actual case IDs from your database)
        const caseIds = [
          "670e3f77d60e436b5c695771",
          "670e3f77d60e436b5c695772",
          "670e3f77d60e436b5c695773",
        ];

        const fetchedCases = [];
        for (const caseId of caseIds) {
          try {
            const response = await fetch(
              `http://localhost:5000/api/cases/${caseId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              if (response.status === 401 || response.status === 403) {
                throw new Error("Session expired. Please log in again.");
              }
              if (response.status === 404) {
                console.log(`Case ${caseId} not found, skipping...`);
                continue; // Skip this case if not found
              }
              throw new Error(
                errorData.message || "Failed to fetch case details."
              );
            }

            const data = await response.json();
            const caseData = data.case;

            // Map backend case data to frontend format
            const mappedCase = {
              id: caseData._id,
              caseId: caseData._id,
              caseTitle: caseData.description || "Untitled Case",
              clientName: caseData.client?.username || "Unknown Client",
              amount: caseData.winning_bid?.amount || 0,
              submittedDate: caseData.createdAt,
              expiryDate: caseData.deadline,
              status: mapStatus(caseData.status), // Map backend status to frontend status
              notes:
                caseData.notes && caseData.notes.length > 0
                  ? caseData.notes[0].content
                  : "No notes available.",
              category: caseData.category || "Other",
            };

            fetchedCases.push(mappedCase);
          } catch (err) {
            console.error(`Error fetching case ${caseId}:`, err.message);
            // Continue fetching other cases even if one fails
          }
        }

        if (fetchedCases.length === 0) {
          throw new Error("No cases found or accessible.");
        }

        setCases(fetchedCases);
        setFilteredCase(fetchedCases);
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
  }, []);

  // Helper function to map backend status to frontend status
  const mapStatus = (backendStatus) => {
    switch (backendStatus.toLowerCase()) {
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

  useEffect(() => {
    // Filter cases based on selected status
    if (selectedStatus === "all") {
      setFilteredCase(cases);
    } else {
      const filtered = cases.filter(
        (caseItem) => caseItem.status === selectedStatus
      );
      setFilteredCase(filtered);
    }
  }, [selectedStatus, cases]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "started":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "on progress":
        return <ChevronDownCircle className="h-5 w-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "started":
        return "bg-yellow-100 text-yellow-800";
      case "on progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl md:text-3xl font-bold">Cases On My Hand</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredCase.length}{" "}
              {selectedStatus === "all" ? "Total" : selectedStatus} Cases
            </h2>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="all">All Cases</option>
              <option value="started">Started</option>
              <option value="on progress">On Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Case List */}
        {filteredCase.length > 0 ? (
          <div className="bg-card text-card-foreground shadow-md rounded-lg overflow-hidden hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
            <ul className="divide-y divide-gray-200">
              {filteredCase.map((caseItem) => (
                <li key={caseItem.id} className="hover:bg-gray-50">
                  <Link to={`/lawyer/cases/${caseItem.id}`} className="block">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <Briefcase className="h-6 w-6 text-blue-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              {getStatusIcon(caseItem.status)}
                              <span
                                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  caseItem.status
                                )}`}
                              >
                                {caseItem.status.charAt(0).toUpperCase() +
                                  caseItem.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FileText className="mr-1 h-4 w-4 text-gray-400" />
                                Client: {caseItem.clientName}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                              Bid Amount: {formatCurrency(caseItem.amount)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                            {caseItem.category}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="mr-1 h-4 w-4 text-gray-400" />
                            Started Date: {formatDate(caseItem.submittedDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                            Expected to End: {formatDate(caseItem.expiryDate)}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                        </div>
                      </div>
                      <div className="mt-2 ml-16">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {caseItem.notes}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
            {selectedStatus !== "all" ? (
              <button
                onClick={() => setSelectedStatus("all")}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                View All Cases
              </button>
            ) : null}
            <Link
              to="/lawyer/cases/available"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Browse Available Cases
            </Link>
          </div>
        )}

        {/* Case Status Guide */}
        <div className="mt-8 bg-card text-card-foreground rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Case Status Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">Started</p>
                <p className="text-sm text-gray-500">
                  The case has just started
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <ChevronDownCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">On Progress</p>
                <p className="text-sm text-gray-500">The case is in progress</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="font-medium text-foreground">Completed</p>
                <p className="text-sm text-gray-500">The case is completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
