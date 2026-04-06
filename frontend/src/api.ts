import axios from 'axios';

// Strip trailing slash in case VITE_API_URL was set with one (e.g. "https://...onrender.com/")
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

/**
 * Pre-configured axios instance pointing to the correct backend URL.
 * Automatically injects the JWT Authorization header on every request.
 */
const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
export { API_BASE };
