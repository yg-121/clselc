import axios from 'axios'

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`🔍 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`)
    return response
  },
  (error) => {
    // Log error responses
    console.error(`❌ API Response Error: ${error.response?.status || 'Unknown'} from ${error.config.url}`)
    console.error('Error details: ', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Auth endpoints
export const auth = {
  register: (data) =>
    api.post("/auth/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
}

// Client endpoints
export const client = {
  getDashboard: () => api.get("/api/users/dashboard/client"),
  getCases: (status) => api.get(`/api/cases${status ? `?status=${status}` : ""}`),
  createCase: (data) =>
    api.post("/api/cases", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getLawyers: (params) => api.get("/api/users/lawyers", { params }),
  getNotifications: () => api.get("/api/notifications"),
}

export default api
