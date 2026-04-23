import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styled from "styled-components";

import { login as loginAPI } from "../api/users";
import { useAuth } from "../context/AuthContext";

const LoginStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 25px);

  .container {
    display: flex;
    flex-direction: column;
    width: 480px;
    background-color: var(--color-sidebar);
    border-radius: 16px;
    padding: 40px 36px 32px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }

  .input-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    gap: 8px;
  }

  input {
    background-color: var(--color-input-bg);
    border: 1.5px solid var(--color-border);
    width: 100%;
    height: 45px;
    border-radius: 50px;
    padding: 0 20px;
    font-size: 14px;
    color: var(--color-text);
    outline: none;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  input::placeholder {
    color: #888;
    font-size: 12px;
  }

  input:focus {
    border-color: var(--color-active);
    background-color: var(--color-input-focus-bg);
  }

  .signup-link {
    font-size: 12px;
    color: #aaa;
    text-decoration: none;
    margin-top: 4px;
    padding-left: 4px;
    transition: color 0.2s;
  }

  .signup-link span {
    color: var(--color-active);
    font-weight: 600;
  }

  .signup-link:hover {
    color: #888;
  }

  .login-box {
    margin-top: 5px;
    width: 100%;
    height: 50px;
    background-color: var(--color-active);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.1s;
  }

  .login-box:hover {
    opacity: 0.85;
  }

  .login-box:active {
    transform: scale(0.97);
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const handlesubmit = async (e) => {
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
    <LoginStyles>
      <form onSubmit={handlesubmit}>
        <div className="container">
          <div className="input-wrap">
            <label>
              이메일
              <input
                type="text"
                className="id"
                placeholder="이메일을 입력해주세요"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </label>
            <label>
              비밀번호
              <input
                type="password"
                className="pw"
                placeholder="비밀번호를 입력해주세요"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </label>
          </div>
          <button type="submit" className="login-box">
            로그인
          </button>
          <Link to="/register" className="signup-link">
            계정이 없으신가요? <span>회원가입 하러가기</span>
          </Link>
        </div>
      </form>
    </LoginStyles>
  );
};

export default LoginPage;
