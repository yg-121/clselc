import axios from "axios";

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor to log all API calls
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log all API responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    console.error("Error details:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error, setError) => {
  console.error("API Error:", error)
  const message = error.response?.data?.message || "An unexpected error occurred"
  setError(message)
  return message
}

export default api

// Add a specific function for appointments to debug
export const fetchAppointments = async (statusFilter = "") => {
  try {
    let url = "/appointments";
    if (statusFilter) {
      url += `?status=${statusFilter}`;
    }
    
    console.log("Fetching appointments with URL:", url);
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Full URL:", `${api.defaults.baseURL}${url}`);
    
    const token = localStorage.getItem("token");
    console.log("Using token:", token ? `${token.substring(0, 10)}...` : "No token");
    
    const response = await api.get(url);
    console.log("Appointments fetch response:", response);
    return response.data;
  } catch (error) {
    console.error("Appointments fetch error:", error);
    throw error;
  }
};

// Update the appointment service
export const appointment = {
  createAppointment: (data) => api.post("/appointments", data),
  getAppointments: (params) => {
    console.log("getAppointments called with params:", params);
    return api.get("/appointments", { params });
  },
  confirmAppointment: (id) => api.patch(`/appointments/${id}/confirm`),
  cancelAppointment: (id) => api.patch(`/appointments/${id}/cancel`),
  changeAppointmentDate: (id, data) => api.patch(`/appointments/${id}/date`, data),
  completeAppointment: (id) => api.patch(`/appointments/${id}/complete`),
  getICSFile: (id) => api.get(`/appointments/${id}/ics`),
};

// Add a function to check API configuration
export const checkApiConfig = () => {
  console.log("API Configuration:");
  console.log("Base URL:", api.defaults.baseURL);
  console.log("Timeout:", api.defaults.timeout);
  console.log("Headers:", api.defaults.headers);
  console.log("WithCredentials:", api.defaults.withCredentials);
  
  // Check if the token is being set correctly
  const token = localStorage.getItem("token");
  console.log("Token in localStorage:", token ? `${token.substring(0, 10)}...` : "No token");
  
  // Check environment variables
  console.log("Environment:", import.meta.env.MODE);
  console.log("API URL from env:", import.meta.env.VITE_API_URL);
  
  return {
    baseURL: api.defaults.baseURL,
    token: token ? `${token.substring(0, 10)}...` : "No token",
    environment: import.meta.env.MODE
  };
};

// Call this function to log the configuration
checkApiConfig();


