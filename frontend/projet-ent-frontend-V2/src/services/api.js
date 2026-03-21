import axios from 'axios';

const SERVER_IP = process.env.REACT_APP_SERVER_IP || window.location.hostname;

export const API_URLS = {
  auth:     `http://${SERVER_IP}:8001`,
  upload:   `http://${SERVER_IP}:8002`,
  download: `http://${SERVER_IP}:8003`,
  admin:    `http://${SERVER_IP}:8004`,
  chat:     `http://${SERVER_IP}:8005`,
  messages: `http://${SERVER_IP}:8006`,
};

const apiClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URLS.auth}/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = response.data.access_token;
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username',      username);
    formData.append('password',      password);
    formData.append('grant_type',    'password');
    formData.append('client_id',     'ent-client');
    formData.append('client_secret', 'votre-secret-client');
    const response = await axios.post(
      `${API_URLS.auth}/login`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  },
  verify: async () => {
    const response = await apiClient.get(`${API_URLS.auth}/verify`);
    return response.data;
  },
};

export const chatService = {
  publicAsk: async (question) => {
    const response = await axios.post(`${API_URLS.chat}/chat/public/ask`, { question });
    return response.data;
  },
  privateAsk: async (question) => {
    const response = await apiClient.post(`${API_URLS.chat}/chat/ask`, { question });
    return response.data;
  },
  health: async () => {
    const response = await axios.get(`${API_URLS.chat}/chat/health`);
    return response.data;
  },
};

export const uploadService = {
  uploadCourse: async (formData) => {
    const response = await apiClient.post(`${API_URLS.upload}/cours`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getTeacherCourses: async () => {
    const response = await apiClient.get(`${API_URLS.upload}/cours/teacher`);
    return response.data;
  },
  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`${API_URLS.upload}/cours/${courseId}`);
    return response.data;
  },
};

export const downloadService = {
  getAllCourses: async () => {
    const response = await apiClient.get(`${API_URLS.download}/cours`);
    return response.data;
  },
  getCourseDetails: async (courseId) => {
    const response = await apiClient.get(`${API_URLS.download}/cours/${courseId}`);
    return response.data;
  },
  getDownloadLink: async (courseId) => {
    const response = await apiClient.get(`${API_URLS.download}/cours/${courseId}/download`);
    return response.data;
  },
};

export const adminService = {
  getAllUsers: async (role = null) => {
    const url = role
      ? `${API_URLS.admin}/admin/users?role=${role}`
      : `${API_URLS.admin}/admin/users`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getUser: async (userId) => {
    const response = await apiClient.get(`${API_URLS.admin}/admin/users/${userId}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post(`${API_URLS.admin}/admin/users`, userData);
    return response.data;
  },
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`${API_URLS.admin}/admin/users/${userId}`, userData);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`${API_URLS.admin}/admin/users/${userId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get(`${API_URLS.admin}/admin/stats`);
    return response.data;
  },
};

export const messageService = {
  getInbox: async () => {
    const response = await apiClient.get(`${API_URLS.messages}/messages/inbox`);
    return response.data;
  },
  getSent: async () => {
    const response = await apiClient.get(`${API_URLS.messages}/messages/sent`);
    return response.data;
  },
  sendMessage: async (receiver, subject, body) => {
    const response = await apiClient.post(`${API_URLS.messages}/messages/send`, { receiver, subject, body });
    return response.data;
  },
  markRead: async (id) => {
    const response = await apiClient.put(`${API_URLS.messages}/messages/${id}/read`);
    return response.data;
  },
  deleteMessage: async (id) => {
    const response = await apiClient.delete(`${API_URLS.messages}/messages/${id}`);
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get(`${API_URLS.messages}/messages/users`);
    return response.data;
  },
};

export default apiClient;
