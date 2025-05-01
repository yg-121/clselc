import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  ChevronDownCircle,
  BarChart2,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function CaseAnalytics() {
  const { caseId } = useParams(); // Get caseId from URL
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        const decoded = jwtDecode(token);
        if (!decoded.id) {
          throw new Error("User ID not found in token.");
        }

        const response = await fetch(
          `http://localhost:5000/api/cases/analytics/${caseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              "Session expired or unauthorized. Please log in again."
            );
          }
          if (response.status === 404) {
            throw new Error("Case not found or not assigned to you.");
          }
          throw new Error(errorData.message || "Failed to fetch analytics.");
        }

        const data = await response.json();
        console.log("Analytics API response:", data);
        setAnalytics(data.analytics);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [caseId]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "posted":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "assigned":
        return <ChevronDownCircle className="h-5 w-5 text-green-500" />;
      case "closed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "posted":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-green-100 text-green-800";
      case "closed":
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md">
            Case Analytics
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Cases Link */}
        <Link
          to="/lawyer/cases"
          className="inline-flex items-center text-sm text-primary hover:underline mb-6"
        >
          <ChevronRight className="h-5 w-5 transform rotate-180 mr-1" />
          Back to Cases
        </Link>

        {/* Analytics Overview */}
        <div className="bg-card text-card-foreground rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10">
          <h2 className="text-xl font-semibold text-foreground mb-4 tracking-tight flex items-center">
            <BarChart2 className="h-6 w-6 text-primary mr-2" />
            Analytics for Case ID: {caseId}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status */}
            <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="flex items-center">
                {getStatusIcon(analytics.status)}
                <h3 className="ml-2 text-lg font-medium text-foreground">
                  Status
                </h3>
              </div>
              <p
                className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(
                  analytics.status
                )}`}
              >
                {analytics.status || "N/A"}
              </p>
            </div>

            {/* Category */}
            <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-foreground">
                  Category
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {analytics.category || "N/A"}
                </span>
              </p>
            </div>

            {/* Active Deadlines */}
            <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-foreground">
                  Active Deadlines
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {analytics.activeDeadlines || 0} pending deadline
                {analytics.activeDeadlines !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Form Usage */}
            <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 md:col-span-2 lg:col-span-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-foreground">
                  Form Usage
                </h3>
              </div>
              <div className="mt-2">
                {Object.keys(analytics.formUsage).length > 0 ? (
                  <ul className="space-y-2">
                    {Object.entries(analytics.formUsage).map(
                      ([formName, count]) => (
                        <li key={formName} className="text-sm text-gray-600">
                          <span className="font-medium">{formName}:</span> Used{" "}
                          {count} time{count !== 1 ? "s" : ""}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    No forms used in this case.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
