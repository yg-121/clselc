"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Filter } from "lucide-react";

// Helper function to map status to color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "posted":
      return "bg-yellow-400";
    case "assigned":
      return "bg-blue-500";
    case "closed":
      return "bg-primary";
    default:
      return "bg-gray-400"; // Fallback color for unknown statuses
  }
};

export default function MyCases({ userRole }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

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

        const text = await res.text(); // Read response as text
        if (!res.ok) {
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            throw new Error(`Server error: ${text}`);
          }
          throw new Error(errorData.message || "Failed to fetch cases.");
        }

        const data = JSON.parse(text); // Parse response
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

  const filteredCases =
    filter === "all"
      ? cases
      : cases.filter((c) => c.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="relative inline-block">
            <p className="text-lg font-bold text-foreground bg-gradient-to-r from-primary/10 to-primary/20 px-4 py-2 rounded-full shadow-md animate-pulse">
              {filteredCases.length} Total Cases
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card"
              >
                <option value="all">All Cases</option>
                <option value="posted">Posted</option>
                <option value="assigned">Assigned</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <Link
              to={`/client/cases/post`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Post a New Case
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {filteredCases.length > 0 ? (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8">
            <ul className="divide-y divide-border">
              {filteredCases.map((caseItem) => (
                <li
                  key={caseItem._id}
                  className="py-6 px-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:shadow-xl hover:scale-[1.02] rounded-lg hover:border hover:border-primary/30"
                >
                  <Link to={`/client/cases/${caseItem._id}`} className="block">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-xl">
                        {caseItem.category}
                      </div>
                      <span
                        className={`px-4 py-1.5 text-sm text-white rounded-full ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground mb-2 text-base">
                      {caseItem.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      Deadline:{" "}
                      {new Date(caseItem.deadline).toLocaleDateString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center py-14">
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No cases found
            </h3>
            <p className="text-muted-foreground mb-6">
              You don’t have any cases yet.
            </p>
            <Link
              to={`/client/cases/post`}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Post a New Case
            </Link>
          </div>
        )}

        <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Case Status Guide
          </h2>
          <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-6 sm:space-y-0">
            <CaseStatus
              color="bg-yellow-400"
              label="Posted"
              description="Case is posted and waiting for lawyers"
            />
            <CaseStatus
              color="bg-blue-500"
              label="Assigned"
              description="Case is currently being worked on"
            />
            <CaseStatus
              color="bg-primary"
              label="Closed"
              description="Case has been resolved or cancelled"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseStatus({ color, label, description }) {
  return (
    <div className="flex items-center">
      <span
        className={`h-6 w-6 rounded-full ${color} flex items-center justify-center mr-3`}
      >
        <span className="text-white text-xs">✔</span>
      </span>
      <div>
        <p className="text-base font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
