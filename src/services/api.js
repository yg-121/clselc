import axios from "axios"

const API_URL = "http://localhost:5000"

const api = axios.create({
  baseURL: API_URL,
})

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Auth endpoints
export const auth = {
  register: (data) =>
    api.post("/api/auth/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  login: (data) => api.post("/api/auth/login", data),
  forgotPassword: (data) => api.post("/api/auth/forgot-password", data),
  resetPassword: (data) => api.post("/api/auth/reset-password", data),
  verify: () => api.get("/api/auth/verify"),
}

export default api
