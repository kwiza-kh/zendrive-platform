export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
export const STATIC_BASE_URL =
  process.env.REACT_APP_STATIC_BASE_URL || "http://localhost:8000";

export const resolveImage = (src) => {
  if (!src) return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200";
  if (src.startsWith("http")) return src;
  return `${STATIC_BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
};

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
