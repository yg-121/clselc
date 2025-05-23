import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    console.log(`🔍 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Response Error: ${error.response?.status || 'Unknown'} from ${error.config.url}`);
    console.error('Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const auth = {
  register: (data) => api.post('/auth/register', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

const client = {
  getDashboard: () => api.get('/users/dashboard/client'),
  getCases: (status) => api.get(`/cases${status ? `?status=${status}` : ''}`),
  createCase: (data) => api.post('/cases', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getLawyers: (params) => api.get('/users/lawyers', { params }),
};

const chat = {
  getChatHistory: (userId) => api.get(`/chats/history/${userId}`),
  sendMessage: (data) => api.post('/chats/send', data),
  sendMessageWithFile: (data) => api.post('/chats/send', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  markChatAsRead: (chatId) => api.patch(`/chats/read/${chatId}`),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
  blockUser: (userId) => api.post(`/chats/block/${userId}`),
  unblockUser: (userId) => api.post(`/chats/unblock/${userId}`),
};

const user = {
  getBlockedStatus: (userId) => api.get(`/users/blocked/${userId}`),
  getBlockedUsers: () => api.get('/users/blocked'),
  getLawyerById: (lawyerId) => api.get(`/users/lawyers/${lawyerId}`),
};

export default { ...api, auth, client, chat, user };
export { auth, client, chat, user };