import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

export default instance;
