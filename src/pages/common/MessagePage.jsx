import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

const API_URL = "http://localhost:5000";
const socket = io(API_URL);

const MessagePage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Using the lawyers endpoint from your codebase
        const response = await axios.get(`${API_URL}/api/users/lawyers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Lawyers data:", response.data);
        
        // Handle different response structures based on your API
        const lawyersData = response.data.lawyers || response.data || [];
        setLawyers(lawyersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lawyers:", error);
        setError("Failed to load lawyers");
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  // Handle lawyer selection
  const handleSelectLawyer = (lawyer) => {
    setSelectedUser(lawyer);
    console.log("Selected lawyer:", lawyer);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left column - Lawyers List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Lawyers</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading lawyers...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="p-4 text-gray-500">
            <p>No lawyers found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {lawyers.map((lawyer) => (
              <li 
                key={lawyer._id}
                onClick={() => handleSelectLawyer(lawyer)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                    {lawyer.username ? lawyer.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{lawyer.username}</p>
                    <p className="text-sm text-gray-500">
                      {lawyer.specialization ? 
                        (Array.isArray(lawyer.specialization) ? 
                          lawyer.specialization.join(', ') : 
                          lawyer.specialization) : 
                        'Lawyer'}
                    </p>
                    {lawyer.location && (
                      <p className="text-xs text-gray-400">{lawyer.location}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Right column - Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">{selectedUser.username}</h2>
              {selectedUser.specialization && (
                <p className="text-sm text-gray-500">
                  {Array.isArray(selectedUser.specialization) ? 
                    selectedUser.specialization.join(', ') : 
                    selectedUser.specialization}
                </p>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-center text-gray-500">
                Select a lawyer to start chatting
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a lawyer to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
