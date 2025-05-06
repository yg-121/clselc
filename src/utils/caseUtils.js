import api from "./api";

/**
 * Safely fetch case details with error handling
 * @param {string} caseId - The ID of the case to fetch
 * @param {object} fallbackData - Data to use if the API call fails
 * @returns {Promise<object>} - The case data or fallback data
 */
export const fetchCaseDetailsWithFallback = async (caseId, fallbackData = {}) => {
  if (!caseId) {
    console.error("No case ID provided");
    return fallbackData;
  }

  try {
    console.log("Fetching case details for:", caseId);
    const response = await api.get(`/cases/${caseId}`);
    console.log("Case details API response:", response.data);
    
    // The backend returns { message: 'Case details fetched', case: filteredCase }
    if (response.data && response.data.case) {
      return response.data.case;
    } 
    // If for some reason the API returns the case directly
    else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn("Unexpected case details format:", response.data);
    return fallbackData;
  } catch (error) {
    console.error("Failed to fetch case details:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    // If we get a 403 Unauthorized error, we should handle it gracefully
    if (error.response?.status === 403) {
      console.log("User not authorized to view this case");
      return { 
        ...fallbackData,
        _unauthorized: true,
        message: "You don't have permission to view the full details of this case."
      };
    }
    
    // If we get a 404 Not Found error
    if (error.response?.status === 404) {
      console.log("Case not found");
      return { 
        ...fallbackData,
        _notFound: true,
        message: "This case could not be found."
      };
    }
    
    // For other errors, just return the fallback data
    return fallbackData;
  }
};

/**
 * Safely fetch bids for a case with error handling
 * @param {string} caseId - The ID of the case to fetch bids for
 * @returns {Promise<Array>} - The bids or an empty array
 */
export const fetchCaseBidsWithFallback = async (caseId) => {
  if (!caseId) {
    console.error("No case ID provided");
    return [];
  }

  try {
    // The correct endpoint based on the backend route
    console.log("Fetching bids for case:", caseId);
    const response = await api.get(`/cases/${caseId}/bids`);
    console.log("Bids API response:", response.data);
    
    // The backend likely returns { message: 'Bids fetched', bids: [...] }
    if (response.data && Array.isArray(response.data.bids)) {
      return response.data.bids;
    } 
    // If for some reason the API returns the bids directly
    else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn("Unexpected bids data format:", response.data);
    return [];
  } catch (error) {
    console.error("Failed to fetch bids:", error);
    
    // If we get a 403 Unauthorized error, we should handle it gracefully
    if (error.response?.status === 403) {
      console.log("User not authorized to view bids for this case");
      return [];
    }
    
    return [];
  }
};