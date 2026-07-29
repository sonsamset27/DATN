import axios from "axios";
import { API_BASE_URL } from "./constants";
import toast from "react-hot-toast";
import { useAuthStore } from "../features/auth/store/auth.store";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || "Something went wrong!";
    // Tự động báo lỗi (trừ những endpoint muốn tự handle)
    if (!error.config?.hideErrorToast) {
       toast.error(message);
    }
    
    // Auto logout if 401
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
       useAuthStore.getState().logout();
       window.location.href = "/";
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
