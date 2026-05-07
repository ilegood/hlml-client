import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  const login = (data) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("name", user.nickname);
    localStorage.setItem("email", user.email);
    localStorage.setItem("bio", user.bio || "");
    localStorage.setItem("profile_img", user.profile_img || "");
    localStorage.setItem("userId", user.id);
    
    setToken(token);
    setName(user.nickname);
    setUserId(user.id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("bio");
    localStorage.removeItem("profile_img");
    localStorage.removeItem("userId");
    
    setToken(null);
    setName(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, token, name, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
