import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("name"));

  const login = (data) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("name", user.nickname);
    localStorage.setItem("email", user.email);
    localStorage.setItem("bio", user.bio || "");
    localStorage.setItem("profile_img", user.profile_img || "");
    
    setToken(token);
    setName(user.nickname);
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
