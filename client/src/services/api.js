import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, password) => 
    api.post('/auth/register', { username, password }),
  
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  getMe: () => 
    api.get('/auth/me')
};

export const wishAPI = {
  getAll: () => 
    api.get('/wishes'),
  
  create: (title, imageFile) => {
    const formData = new FormData();
    formData.append('title', title);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return api.post('/wishes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  update: (id, title, imageFile) => {
    const formData = new FormData();
    formData.append('title', title);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return api.put(`/wishes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  delete: (id) => 
    api.delete(`/wishes/${id}`)
};

// Публичный API (без авторизации)
export const publicAPI = {
  getWishlist: (publicId) => 
    axios.get(`${API_URL}/public/${publicId}`),
  
  reserveWish: (publicId, wishId, reservedBy) => 
    axios.post(`${API_URL}/public/${publicId}/wishes/${wishId}/reserve`, { reservedBy }),
  
  unreserveWish: (publicId, wishId) => 
    axios.post(`${API_URL}/public/${publicId}/wishes/${wishId}/unreserve`)
};

export default api;

