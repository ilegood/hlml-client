import { createContext, useContext, useState } from "react";

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
  const [token, setToken] = useState(storedToken);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [profileImg, setProfileImg] = useState(localStorage.getItem("profile_img"));
  const [userId, setUserId] = useState(
    localStorage.getItem("user_id") || getUserIdFromToken(storedToken),
  );

  const login = (data) => {
    localStorage.setItem("token", data.token);
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
