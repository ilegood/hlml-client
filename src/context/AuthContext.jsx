import { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../api/instance";

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const getUserIdFromToken = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ? String(payload.userId) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem("token");
  const storedTokenBase = localStorage.getItem("auth_api_base");
  const tokenMatchesApi = storedToken && storedTokenBase === BASE_URL;

  if (storedToken && !tokenMatchesApi) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("bio");
    localStorage.removeItem("profile_img");
  }

  const activeStoredToken = tokenMatchesApi ? storedToken : null;
  const [token, setToken] = useState(activeStoredToken);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [profileImg, setProfileImg] = useState(localStorage.getItem("profile_img"));
  const [userId, setUserId] = useState(
    localStorage.getItem("user_id") || getUserIdFromToken(activeStoredToken),
  );

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUserId(null);
      setName(null);
      setProfileImg(null);
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("auth_api_base", BASE_URL);
    localStorage.setItem("user_id", data.user_id || "");
    localStorage.setItem("name", data.nickname);
    localStorage.setItem("email", data.email);
    localStorage.setItem("bio", data.bio || "");
    localStorage.setItem("profile_img", data.profile_img || "");
    
    setToken(data.token);
    setUserId(data.user_id ? String(data.user_id) : "");
    setName(data.nickname);
    setProfileImg(data.profile_img || "");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_api_base");
    localStorage.removeItem("user_id");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("bio");
    localStorage.removeItem("profile_img");
    
    setToken(null);
    setUserId(null);
    setName(null);
    setProfileImg(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, token, name, userId, profileImg }}>
      {children}
    </AuthContext.Provider>
  );
};
