import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  ArrowRight 
} from "lucide-react";

export default function LawyerAllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const res = await fetch("http://localhost:5000/api/cases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        if (!res.ok) {
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            throw new Error(`Server error: ${text} (Status: ${res.status})`);
          }
          throw new Error(errorData.message || `HTTP error ${res.status}`);
        }

        const data = JSON.parse(text);
        console.log("Fetched cases:", data.cases);
        setCases(data.cases || []);
        
        // Extract unique categories for filter
        const uniqueCategories = [...new Set(data.cases.map(c => c.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases
    .filter((caseItem) => caseItem.status?.toLowerCase() === "posted")
    .filter((caseItem) => {
      // Filter by category if not "all"
      if (selectedCategory !== "all") {
        return caseItem.category === selectedCategory;
      }
      return true;
    })
    .filter((caseItem) => {
      const term = searchTerm.toLowerCase();
      return (
        (caseItem.category?.toLowerCase() || "").includes(term) ||
        (caseItem.description?.toLowerCase() || "").includes(term) ||
        (caseItem.client?.username?.toLowerCase() || "").includes(term)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by createdAt in descending order (newest first)

  const formatSimpleDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "posted":
        return "bg-yellow-500";
      case "assigned":
        return "bg-blue-500";
      case "closed":
        return "bg-green-600";
      default:
        return "bg-gray-500";
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
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center mt-4 shadow-md">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Posted Cases</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cases by description, category or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}

        {/* Case Grid */}
        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <Link
                key={caseItem._id}
                to={`/lawyer/all-cases/${caseItem._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 hover:border-primary/30 group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {caseItem.category || "Uncategorized"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Posted: {formatSimpleDate(caseItem.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs text-white rounded-full ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3 group-hover:text-gray-900 transition-colors">
                      {caseItem.description || "No description available"}
                    </p>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Client: {caseItem.client?.username || "N/A"}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>
                      Deadline:{" "}
                      {caseItem.deadline
                        ? formatSimpleDate(caseItem.deadline)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                      View Details <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No cases found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "all"
                ? "No cases match your current search criteria. Try adjusting your filters."
                : "There are no available cases at the moment. Please check back later."}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-700">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Available Cases
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredCases.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50 text-purple-700">
                <Tag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-50 text-amber-700">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Latest Update
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {filteredCases.length > 0
                    ? formatSimpleDate(filteredCases[0].createdAt)
                    : "No cases"}
                </h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            How Bidding Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Browse Cases
              </h3>
              <p className="text-sm text-gray-600">
                Explore available cases that match your expertise and interests.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Submit Your Bid
              </h3>
              <p className="text-sm text-gray-600">
                Propose your fee and timeline for handling the case.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Get Assigned
              </h3>
              <p className="text-sm text-gray-600">
                If your bid is accepted, you'll be assigned to the case.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
