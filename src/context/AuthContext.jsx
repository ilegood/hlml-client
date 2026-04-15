import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name"));

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.nickname);
    localStorage.setItem("email", data.email);
    localStorage.setItem("bio", data.bio || "");
    localStorage.setItem("profile_img", data.profile_img || "");
    
    setToken(data.token);
    setName(data.nickname);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("bio");
    localStorage.removeItem("profile_img");
    
    setToken(null);
    setName(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, token, name }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
