import axios from "axios";

const api = axios.create({
  baseURL: "https://saeduid-backend-production.up.railway.app/api/v1",
  // baseURL: "http://localhost:8080/api/v1",
});

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
  },
);
export default api;
