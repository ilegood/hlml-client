import axios from "axios";

<<<<<<< Updated upstream
const DEFAULT_API_URL = "https://hlml-server-gleaming-mountain-8819.fly.dev";

// Use the local API during development and the deployed API when no build-time
// override is provided. Keeping this in one place also keeps image URLs and
// Axios requests pointed at the same server.
export const BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, "");
=======
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
>>>>>>> Stashed changes

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
