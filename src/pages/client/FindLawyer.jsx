"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";

export default function FindLawyers({ userRole }) {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [practiceAreas] = useState([
    "Property Law",
    "Contract Law",
    "Family Law",
    "Criminal Law",
    "Corporate Law",
  ]);
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    minRating: "",
    available: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const queryParams = new URLSearchParams();
        if (filters.specialization) {
          queryParams.append("specialization", filters.specialization);
        }
        if (filters.location) {
          queryParams.append("location", filters.location);
        }
        if (filters.minRating) {
          queryParams.append("minRating", filters.minRating);
        }
        if (filters.available) {
          queryParams.append("available", "true");
        }

        const res = await fetch(
          `http://localhost:5000/api/users/lawyers?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 401 || res.status === 403) {
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(errorData.message || `HTTP error ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched lawyers:", data.lawyers); // Debug log
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

  // Filter lawyers based on search term
  useEffect(() => {
    const filtered = lawyers.filter(
      (lawyer) =>
        (lawyer.username?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (lawyer.specialization?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="font-inter bg-gray-100 text-gray-900 min-h-screen">
      <div className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            Find the Right Lawyer
          </h1>
          <p className="text-gray-300 mb-6">
            Connect with experienced lawyers for your legal needs. Get
            professional advice and representation.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Find a lawyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-500 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white text-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Lawyers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300"
              >
                <option value="">All Specializations</option>
                {practiceAreas.map((area, index) => (
                  <option key={index} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="minRating"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                placeholder="e.g., 4.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={filters.available}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="available"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Available Only
              </label>
            </div>
          </div>
        </div>

        {/* Practice Areas Section */}
        <div className="bg-white text-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Legal Practice Areas
          </h2>
          <p className="text-gray-500 mb-4">
            Find lawyers specialized in various areas of Ethiopian law
          </p>
          <div className="flex flex-wrap gap-3">
            {practiceAreas.map((area, index) => (
              <button
                key={index}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, specialization: area }))
                }
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filters.specialization === area
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Lawyers List */}
        <div className="bg-white text-gray-900 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Rated Lawyers
            </h2>
            <Link
              to={`/${userRole}/lawyers/all`}
              className="text-blue-500 hover:underline transition-colors duration-200"
            >
              View All Lawyers →
            </Link>
          </div>
          <p className="text-gray-500 mb-4">
            Experienced professionals ready to help with your legal matters
          </p>
          {filteredLawyers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredLawyers.map((lawyer) => (
                <li key={lawyer._id} className="py-4">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={
                        lawyer.profile_photo ||
                        "/placeholder.svg?height=50&width=50"
                      }
                      alt={lawyer.username}
                    />
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {lawyer.username || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {lawyer.specialization || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Location: {lawyer.location || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rating:{" "}
                        {lawyer.averageRating
                          ? lawyer.averageRating.toFixed(1)
                          : "N/A"}{" "}
                        ({lawyer.ratingCount || 0} reviews)
                      </p>
                      <p className="text-sm text-gray-500">
                        Hourly Rate:{" "}
                        {lawyer.hourlyRate ? `${lawyer.hourlyRate} ETB` : "N/A"}
                      </p>
                    </div>
                    <Link
                      to={`/${userRole}/lawyers/${lawyer._id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Contact
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <User className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">No lawyers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
