import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login as loginAPI } from "../api/users";
import { useAuth } from "../context/AuthContext.jsx";

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAPI(form);
      login(data);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  return {
    form,
    handleChange,
    handleSubmit,
  };
};
