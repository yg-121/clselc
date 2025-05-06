/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-undef */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Eye, FileText, Download } from "react-feather"
// eslint-disable-next-line no-unused-vars
import api, { handleApiError } from "../../utils/api"
import DataTable from "../../components/admin/DataTable"
import Modal from "../../components/admin/Modal"
import ErrorAlert from "../../components/admin/ErrorAlert"
import { formatDate } from "../../utils/formatters"

// Button component
const Button = ({ children, variant = "primary", onClick, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Cases = () => {
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const [showBidsModal, setShowBidsModal] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState([
    "Family Law", "Criminal Law", "Corporate Law", 
    "Immigration", "Real Estate", "Intellectual Property"
  ]);

  // Add these utility functions at the top of your component
  const fetchCaseDetailsWithFallback = async (caseId, fallbackData) => {
    try {
      console.log(`Fetching details for case: ${caseId}`);
      const response = await api.get(`/cases/${caseId}`);
      console.log("Case details response:", response.data);
      
      // The backend returns { message: 'Case details fetched', case: {...} }
      if (response.data && response.data.case) {
        return response.data.case;
      }
      
      // If the API returns the case directly
      if (response.data && response.data._id) {
        return response.data;
      }
      
      console.warn("Unexpected case details format:", response.data);
      return fallbackData || {};
    } catch (error) {
      console.error("Failed to fetch case details:", error);
      
      // Create a fallback with error information
      const result = { ...fallbackData } || {};
      
      if (error.response) {
        if (error.response.status === 403) {
          result._unauthorized = true;
          result.message = "You don't have permission to view this case";
        } else if (error.response.status === 404) {
          result._notFound = true;
          result.message = "Case not found";
        } else {
          result.message = error.response.data?.message || "Error fetching case details";
        }
      } else {
        result.message = error.message || "Network error";
      }
      
      return result;
    }
  };

  const fetchCaseBidsWithFallback = async (caseId) => {
    try {
      console.log(`Fetching bids for case: ${caseId}`);
      const response = await api.get(`/bids/case/${caseId}`);
      console.log("Bids response:", response.data);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && Array.isArray(response.data.bids)) {
        return response.data.bids;
      }
      
      console.warn("Unexpected bids format:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      return [];
    }
  };

  // Check API endpoints
  useEffect(() => {
    const checkEndpoints = async () => {
      try {
        console.log("Checking case endpoints...");
        
        try {
          const response1 = await api.get("/cases");
          console.log("Endpoint /cases works:", response1.data);
        } catch (e) {
          console.log("Endpoint /cases failed:", e.message);
        }
        
        if (selectedCase && selectedCase._id) {
          try {
            const response2 = await api.get(`/cases/${selectedCase._id}`);
            console.log(`Endpoint /cases/${selectedCase._id} works:`, response2.data);
          } catch (e) {
            console.log(`Endpoint /cases/${selectedCase._id} failed:`, e.message);
            console.log("Error details:", e.response?.data || e.message);
          }
          
          try {
            const response3 = await api.get(`/bids/case/${selectedCase._id}`);
            console.log(`Endpoint /bids/case/${selectedCase._id} works:`, response3.data);
          } catch (e) {
            console.log(`Endpoint /bids/case/${selectedCase._id} failed:`, e.message);
          }
        }
      } catch (error) {
        console.error("Endpoint check failed:", error);
      }
    };
    
    checkEndpoints();
  }, [selectedCase]);

  // Fetch cases - Improve error handling and data processing
  const { data: cases, isLoading: isLoadingCases } = useQuery({
    queryKey: ['cases', categoryFilter, statusFilter],
    queryFn: async () => {
      try {
        let url = "/cases";
        const params = {};
        
        if (categoryFilter) params.category = categoryFilter;
        if (statusFilter) params.status = statusFilter;
        
        if (Object.keys(params).length > 0) {
          url += "?" + new URLSearchParams(params).toString();
        }
        
        console.log("Fetching cases from:", url);
        const response = await api.get(url);
        console.log("Cases API response:", response.data);
        
        // Handle the expected response structure from the backend
        if (response.data && Array.isArray(response.data.cases)) {
          return response.data.cases;
        } 
        // If the API returns the cases directly
        else if (Array.isArray(response.data)) {
          return response.data;
        }
        
        console.warn("Unexpected cases data format:", response.data);
        return [];
      } catch (error) {
        console.error("Failed to fetch cases:", error);
        setError("Failed to load cases: " + (error.response?.data?.message || error.message));
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // Add a useEffect to log when filters change
  useEffect(() => {
    console.log("Filters changed - Category:", categoryFilter, "Status:", statusFilter);
  }, [categoryFilter, statusFilter]);

  // Add a useEffect to fetch case details when a case is selected
  const { data: caseDetails, isLoading: isLoadingCaseDetails, error: caseDetailsError } = useQuery({
    queryKey: ['caseDetails', selectedCase?._id],
    queryFn: async () => {
      if (!selectedCase || !selectedCase._id) {
        console.error("No selected case or missing ID");
        return selectedCase; // Return the basic case data we already have
      }
      
      // Use our custom utility function that handles errors and provides fallbacks
      const result = await fetchCaseDetailsWithFallback(selectedCase._id, selectedCase);
      
      // Check if we got an unauthorized or not found response
      if (result._unauthorized || result._notFound) {
        setError(result.message || "Error accessing case details");
      }
      
      return result;
    },
    enabled: !!selectedCase && !!selectedCase._id,
    retry: 1, // Try once more
    retryDelay: 1000,
  });

  // Fetch bids for a case - Using our custom utility function
  const { data: bids, isLoading: isLoadingBids, error: bidsError } = useQuery({
    queryKey: ['bids', selectedCase?._id],
    queryFn: async () => {
      if (!selectedCase || !selectedCase._id) {
        console.error("No selected case or missing ID");
        return [];
      }
      
      console.log("Fetching bids for case:", selectedCase._id);
      // Use our custom utility function that handles errors and provides fallbacks
      return await fetchCaseBidsWithFallback(selectedCase._id);
    },
    enabled: !!selectedCase && showBidsModal,
    retry: 1,
  })

  const handleViewCase = (caseData) => {
    console.log("handleViewCase called with:", caseData);
    
    // Validate case data before setting it
    if (!caseData || !caseData._id) {
      console.error("Invalid case data:", caseData);
      setError("Cannot view this case: Invalid case data");
      return;
    }
    
    setSelectedCase(caseData);
    setShowDetailsModal(true);
    
    console.log("Modal should be visible now. showDetailsModal:", true);
  }

  // eslint-disable-next-line no-unused-vars
  const handleViewBids = () => {
    setShowBidsModal(true)
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "ID",
        cell: ({ row }) => (
          <button
            onClick={() => handleViewCase(row.original)}
            className="text-indigo-600 hover:text-indigo-900 underline text-xs"
            type="button"
          >
            {row.original._id}
          </button>
        ),
      },
      {
        accessorKey: "client.username",
        header: "Client",
        cell: ({ row }) => {
          // Check if client exists and has username
          if (row.original.client && typeof row.original.client === 'object' && row.original.client.username) {
            return row.original.client.username;
          }
          // Check if client is a string (ID only)
          else if (typeof row.original.client === 'string' && row.original.client) {
            return `Client ID: ${row.original.client.substring(0, 8)}...`;
          }
          // No client data or null client
          return "No Client";
        },
      },
      {
        accessorKey: "assigned_lawyer.username",
        header: "Lawyer",
        cell: ({ row }) => {
          // Check if lawyer exists and has username
          if (row.original.assigned_lawyer && typeof row.original.assigned_lawyer === 'object' && row.original.assigned_lawyer.username) {
            return row.original.assigned_lawyer.username;
          }
          // Check if lawyer is a string (ID only)
          else if (typeof row.original.assigned_lawyer === 'string' && row.original.assigned_lawyer) {
            return `Lawyer ID: ${row.original.assigned_lawyer.substring(0, 8)}...`;
          }
          // No lawyer data or null lawyer
          return "Unassigned";
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.original.status === "Open"
                ? "bg-green-100 text-green-800"
                : row.original.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : row.original.status === "Closed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-purple-100 text-purple-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "deadline",
        header: "Deadline",
        cell: ({ row }) => (row.original.deadline ? formatDate(row.original.deadline) : "No deadline"),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewCase(row.original)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="View case details"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [handleViewCase] // Add handleViewCase to the dependency array
  )

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Case Monitoring</h2>

      {error && (
        <ErrorAlert 
          message={error} 
          type="error" 
          onDismiss={() => setError(null)} 
        />
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => {
              console.log("Category filter changed to:", e.target.value);
              setCategoryFilter(e.target.value);
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              console.log("Status filter changed to:", e.target.value);
              setStatusFilter(e.target.value);
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Posted">Posted</option>
            <option value="Assigned">Assigned</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      {isLoadingCases ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading cases...</p>
        </div>
      ) : cases && cases.length > 0 ? (
        <DataTable 
          columns={columns} 
          data={cases} 
          filterPlaceholder="Search cases..." 
          onRowClick={(row) => handleViewCase(row)}
        />
      ) : (
        <div className="text-center py-4 bg-white shadow rounded-lg">
          <p className="text-gray-500 py-8">No cases found. Try adjusting your filters.</p>
        </div>
      )}

      {/* Case Details Modal */}
      {showDetailsModal && selectedCase && (
        <Modal
          title="Case Details"
          onClose={() => {
            console.log("Closing modal");
            setShowDetailsModal(false);
          }}
          size="lg"
        >
          {isLoadingCaseDetails ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading case details...</p>
            </div>
          ) : caseDetailsError ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {caseDetailsError.message || "Failed to load case details"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Case ID</h3>
                  <p className="mt-1">{caseDetails?._id || selectedCase._id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseDetails?.status || selectedCase.status)}`}>
                      {caseDetails?.status || selectedCase.status || "Unknown"}
                    </span>
                  </p>
                </div>
                {(caseDetails?.category || selectedCase.category) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1">{caseDetails?.category || selectedCase.category}</p>
                  </div>
                )}
                {(caseDetails?.createdAt || selectedCase.createdAt) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1">{formatDate(caseDetails?.createdAt || selectedCase.createdAt)}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1">
                    {getDisplayName(caseDetails?.client || selectedCase.client, 'client')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lawyer</h3>
                  <p className="mt-1">
                    {getDisplayName(caseDetails?.assigned_lawyer || selectedCase.assigned_lawyer, 'lawyer')}
                  </p>
                </div>
                {(caseDetails?.deadline || selectedCase.deadline) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                    <p className="mt-1">{formatDate(caseDetails?.deadline || selectedCase.deadline)}</p>
                  </div>
                )}
              </div>
              
              {(caseDetails?.description || selectedCase.description) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 whitespace-pre-wrap">{caseDetails?.description || selectedCase.description}</p>
                </div>
              )}
              
              {/* Documents Section - Only show if we have documents */}
              {caseDetails?.documents && caseDetails.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Documents</h3>
                  <ul className="mt-1 divide-y divide-gray-200">
                    {caseDetails.documents.map((doc, index) => (
                      <li key={index} className="py-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span>{doc.fileName || doc.name || 'Document'}</span>
                          {(doc.url || doc.filePath) && (
                            <a 
                              href={doc.url || `/api/documents/${doc.filePath}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-auto text-indigo-600 hover:text-indigo-500"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowBidsModal(true)
                  }}
                >
                  View Bids
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Bids Modal */}
      {showBidsModal && selectedCase && (
        <Modal
          title={`Bids for Case: ${selectedCase.description?.substring(0, 30)}...`}
          onClose={() => setShowBidsModal(false)}
          size="lg"
        >
          {isLoadingBids ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading bids...</p>
            </div>
          ) : bidsError ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Failed to load bids. You may not have permission to view them.
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowBidsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {bids && bids.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lawyer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bids.map((bid) => (
                        <tr key={bid._id} className={bid.status === 'Accepted' ? 'bg-green-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {bid.lawyer?.username || 
                             (typeof bid.lawyer === 'string' ? `Lawyer ID: ${bid.lawyer.substring(0, 8)}...` : 'Unknown')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {bid.amount} ETB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              bid.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                              bid.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(bid.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {bid.comment || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No bids found for this case.</p>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowBidsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// Add this helper function to properly display names
const getDisplayName = (entity, type) => {
  if (!entity) {
    return type === 'lawyer' ? 'Not assigned' : 'No Client';
  }
  
  if (typeof entity === 'object' && entity.username) {
    return entity.username;
  }
  
  if (typeof entity === 'string') {
    return `${type === 'lawyer' ? 'Lawyer' : 'Client'} ID: ${entity.substring(0, 8)}...`;
  }
  
  return 'Unknown';
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Posted':
      return 'bg-green-100 text-green-800';
    case 'Assigned':
      return 'bg-yellow-100 text-yellow-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

export default Cases
