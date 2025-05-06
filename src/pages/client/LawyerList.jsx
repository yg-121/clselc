import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";

export default function LawyerList() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Get query parameters from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  useEffect(() => {
    // Set initial search values from URL parameters
    const urlQuery = queryParams.get("q");
    const urlCategory = queryParams.get("category");
    
    if (urlQuery) setSearchQuery(urlQuery);
    if (urlCategory) setSelectedCategory(urlCategory);
    
    fetchLawyers(urlQuery, urlCategory);
  }, [location.search]);
  
  const fetchLawyers = async (query, category) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      
      // Build API URL with search parameters
      let url = "http://localhost:5000/api/lawyers";
      const params = new URLSearchParams();
      
      if (query) params.append("search", query);
      if (category) params.append("specialization", category);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch lawyers.");
      }
      
      const data = await response.json();
      setLawyers(data.lawyers || []);
    } catch (err) {
      console.error("Error fetching lawyers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    
    // Use history to update URL without full page reload
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
    
    // Fetch lawyers with new search parameters
    fetchLawyers(searchQuery, selectedCategory);
  };
  
  // Rest of the component...
}