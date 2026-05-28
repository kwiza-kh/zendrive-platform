import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "";
export const STATIC_BASE_URL = process.env.REACT_APP_STATIC_BASE_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("admin_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      if (!window.location.pathname.endsWith("/login")) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const resolveImage = (src) => {
  if (!src) return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400";
  if (src.startsWith("http")) return src;
  return `${STATIC_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

export const formatPrice = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

export default api;
