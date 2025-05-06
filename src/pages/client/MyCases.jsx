import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Briefcase } from "lucide-react";

export default function MyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredCases = cases.filter((caseItem) => {
    if (filter === "all") return true;
    return caseItem.status.toLowerCase() === filter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "posted":
        return "bg-yellow-400";
      case "assigned":
        return "bg-blue-500";
      case "closed":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  const CaseStatus = ({ color, label, description }) => (
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const res = await fetch("http://localhost:5000/api/cases/my-cases", {
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
            throw new Error(`Server error: ${text}`);
          }
          throw new Error(errorData.message || "Failed to fetch cases.");
        }

        const data = JSON.parse(text);
        setCases(data.cases);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">My Legal Cases</h1>
            <div className="flex space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-primary-foreground/90"
                >
                  <option value="all">All Cases</option>
                  <option value="posted">Posted</option>
                  <option value="assigned">Assigned</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <Link
                to={`/client/cases/post`}
                className="inline-flex items-center px-4 py-2 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary border border-primary/30"
              >
                Post a New Case
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Guide and Case Count */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-card text-card-foreground rounded-lg shadow-sm p-4">
          <div className="relative inline-block mb-4 md:mb-0">
            <p className="text-lg font-bold text-foreground bg-gradient-to-r from-primary/10 to-primary/20 px-4 py-2 rounded-full shadow-md">
              {filteredCases.length} {filter !== "all" ? filter : "Total"} Cases
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <CaseStatus
              color="bg-yellow-400"
              label="Posted"
              description="Waiting for lawyers"
            />
            <CaseStatus
              color="bg-blue-500"
              label="Assigned"
              description="Being worked on"
            />
            <CaseStatus
              color="bg-primary"
              label="Closed"
              description="Resolved or cancelled"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((caseItem) => (
              <Link 
                to={`/client/cases/${caseItem._id}`} 
                key={caseItem._id}
                className="bg-card text-card-foreground rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:scale-[1.02] hover:border hover:border-primary/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-xl truncate pr-2">
                    {caseItem.category}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs text-white rounded-full ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                </div>
                <div className="text-muted-foreground mb-3 text-sm line-clamp-2">
                  {caseItem.description}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>
                    Deadline: {new Date(caseItem.deadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {caseItem.status === "Assigned" ? "Lawyer assigned" : "Awaiting bids"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center py-14">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No cases found
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any cases yet.
            </p>
            <Link
              to={`/client/cases/post`}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Post a New Case
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
