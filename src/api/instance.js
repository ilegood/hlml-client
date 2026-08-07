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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = String(error.response?.data?.message || "").toLowerCase();
    const isInvalidToken =
      status === 401 &&
      (message.includes("token") || message.includes("jwt") || message.includes("인증"));

    if (isInvalidToken && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_api_base");
      localStorage.removeItem("user_id");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("bio");
      localStorage.removeItem("profile_img");
      window.dispatchEvent(new Event("auth:expired"));
    }

    return Promise.reject(error);
  },
);

export default instance;
