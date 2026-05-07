import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login as loginAPI } from "../../api/users";
import { useAuth } from "../../context/auth";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
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
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.inputWrap}>
            <label className={styles.label}>
              이메일
              <input
                className={styles.input}
                type="text"
                name="email"
                placeholder="이메일을 입력해주세요"
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label className={styles.label}>
              비밀번호
              <input
                className={styles.input}
                type="password"
                name="password"
                placeholder="비밀번호를 입력해주세요"
                value={form.password}
                onChange={handleChange}
              />
            </label>
          </div>

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>

          <Link to="/register" className={styles.signupLink}>
            계정이 없으신가요? <span>회원가입 하러가기</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
