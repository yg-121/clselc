"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";

export default function FindLawyers({ userRole }) {
  const [lawyers, setLawyers] = useState([]);
  
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    minRating: "",
    available: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define practice areas for the specialization dropdown
  const practiceAreas = [
    "Property Law",
    "Contract Law",
    "Family Law",
    "Criminal Law",
    "Corporate Law",
  ];

  // Fetch lawyers from the backend
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Build query parameters
      
console.log(token)
        const response = await fetch(
          `http://localhost:5000/api/users/lawyers`,
          {
            method: "GET",
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
          if (response.status === 500) {
            throw new Error(errorData.message || "Failed to fetch lawyers");
          }
          throw new Error(
            errorData.message ||
              `Failed to fetch lawyers (Status: ${response.status})`
          );
        }

        const data = await response.json();
        console.log("Fetched lawyers:", data.lawyers);
        setLawyers(data.lawyers || []);
      } catch (err) {
        console.error("Error fetching lawyers:", err);
        setError(err.message);
        if (err.message.includes("log in")) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [filters]); // Refetch when filters change

  // Filter lawyers based on search term (client-side filtering)
  useEffect(() => {
    const filtered = lawyers.filter((lawyer) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesUsername = (lawyer.username?.toLowerCase() || "").includes(
        searchLower
      );
      const matchesSpecialization = lawyer.specialization?.some((spec) =>
        (spec?.toLowerCase() || "").includes(searchLower)
      );
      return matchesUsername || matchesSpecialization;
    });
    setFilteredLawyers(filtered);
  }, [lawyers, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-600">{error}</p>
        {error.includes("log in") && (
          <p className="mt-2">
            <Link to="/login" className="text-primary hover:underline">
              Click here to log in
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="font-inter bg-background text-foreground min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Find a Lawyer</h1>
          <p className="text-gray-200 mb-6">
            Discover experienced lawyers to assist with your legal needs in
            Ethiopia.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-foreground transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Filter Lawyers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary transition-all duration-300"
              >
                <option value="">All Specializations</option>
                {practiceAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., Addis Ababa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="minRating"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Minimum Rating
              </label>
              <input
                type="number"
                id="minRating"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                min="0"
                max="5"
                step="0.1"
                placeholder="e.g., 4.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary transition-all duration-300"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={filters.available}
                onChange={handleFilterChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="available"
                className="ml-2 text-sm font-medium text-gray-600"
              >
                Available Only
              </label>
            </div>
          </div>
        </div>

        {/* Lawyers List */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Available Lawyers
            </h2>
            <Link
              to={`/${userRole}/lawyers/all`}
              className="text-primary hover:underline text-sm font-medium"
            >
              View All Lawyers
            </Link>
          </div>

          {filteredLawyers.length > 0 ? (
            <div className="space-y-4">
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer._id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <img
                    src={
                      lawyer.profile_photo ||
                      "/placeholder.svg?height=50&width=50"
                    }
                    alt={lawyer.username || "Lawyer"}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">
                      {lawyer.username || "Unknown Lawyer"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Specialization:{" "}
                      {lawyer.specialization?.length > 0
                        ? lawyer.specialization.join(", ")
                        : "Not specified"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Location: {lawyer.location || "Not specified"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rating:{" "}
                      {lawyer.averageRating
                        ? lawyer.averageRating.toFixed(1)
                        : "N/A"}{" "}
                      ({lawyer.ratingCount || 0} reviews)
                    </p>
                    <p className="text-sm text-gray-600">
                      Hourly Rate:{" "}
                      {lawyer.hourlyRate
                        ? `${lawyer.hourlyRate} ETB`
                        : "Not specified"}
                    </p>
                  </div>
                  <Link
                    to={`/${userRole}/lawyers/${lawyer._id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300"
                  >
                    Contact
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                No lawyers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
