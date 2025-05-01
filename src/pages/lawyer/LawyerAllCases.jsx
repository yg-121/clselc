import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export default function LawyerAllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

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
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="font-inter bg-gray-100 min-h-screen p-8 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Posted Cases</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white transition-all duration-300"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-500 rounded-lg text-center">
            {error}
            {error.includes("token") && (
              <p className="mt-2">
                <Link to="/login" className="text-blue-500 hover:underline">
                  Click here to log in
                </Link>
              </p>
            )}
            {error.includes("HTTP error") && (
              <p className="mt-2">
                Please ensure the server is running or contact support if the
                issue persists.
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && filteredCases.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {filteredCases.map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="bg-white text-gray-900 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:scale-101 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-blue-500/10"
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-purple-100 p-3 mb-4">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {caseItem.category || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 text-center">
                      Client: {caseItem.client?.username || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 text-center line-clamp-2">
                      {caseItem.description || "No description available"}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 text-center">
                      Deadline:{" "}
                      {caseItem.deadline
                        ? formatSimpleDate(caseItem.deadline)
                        : "N/A"}
                    </p>
                    <span
                      className={`px-4 py-1 text-xs text-white rounded-full uppercase mb-4 ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status || "Unknown"}
                    </span>
                    {caseItem._id ? (
                      <Link
                        to={`/lawyer/all-cases/${caseItem._id}`} // Updated to match the route in App.jsx
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                      >
                        View Details
                      </Link>
                    ) : (
                      <span className="text-red-500 text-sm">
                        Invalid Case ID
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No cases available for bidding
              </h3>
              <p className="text-gray-500">
                There are no posted cases available at the moment.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
