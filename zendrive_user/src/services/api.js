import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth helpers
export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
export const setUser = (u) => localStorage.setItem("user", JSON.stringify(u));
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};
export const isAuthenticated = () => !!getToken();

// Endpoints
export const authApi = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  me: () => api.get("/api/auth/me"),
};

export const carsApi = {
  list: (params) => api.get("/api/cars", { params }),
  detail: (slug) => api.get(`/api/cars/${slug}`),
};

export const brandsApi = {
  list: () => api.get("/api/brands"),
};

export const bodyTypesApi = {
  list: () => api.get("/api/body-types"),
};

export const inquiriesApi = {
  create: (data) => api.post("/api/inquiries", data),
};

export const contactInfoApi = {
  list: () => api.get("/api/contact-info"),
};

export const socialMediaApi = {
  list: () => api.get("/api/social-media"),
};

export default api;
