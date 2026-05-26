import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });

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

export const contactInfoApi = {
  list: () => api.get("/api/contact-info"),
};

export const socialMediaApi = {
  list: () => api.get("/api/social-media"),
};

export default api;
