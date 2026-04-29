import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";

const LoginStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 25px);

  .container {
    display: flex;
    flex-direction: column;
    width: 480px;
    background-color: var(--color-bg);
    border-radius: 16px;
    padding: 40px 36px 32px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }

  input {
    background-color: var(--color-bg);
    border: 1.5px solid #d3d3d3;
    width: 100%;
    height: 40px;
    border-radius: 50px;
    padding: 0 15px;
    margin-top: 5px;
    font-size: 14px;
    color: var(--color-text);
    outline: none;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  input:focus {
    border-color: var(--color-active);
    background-color: #fff8f2;
  }

  .signup-link {
    display: block;
    font-size: 12px;
    color: #aaa;
    text-decoration: none;
    margin-top: 10px;
    padding-left: 4px;
  }

  .signup-link span {
    color: var(--color-active);
    font-weight: 600;
  }

  .login-box {
    margin-top: 20px;
    width: 100%;
    height: 50px;
    background-color: var(--color-active);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
  }

  .login-box:hover {
    opacity: 0.85;
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://${window.location.hostname}:4000/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`${data.user.nickname}님, 환영합니다!`);
        navigate("/chatrooms");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <LoginStyles>
      <form onSubmit={handleLogin}>
        <div className="container">
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="이메일을 입력해주세요"
            />
          </label>
          <label style={{ marginTop: "15px" }}>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력해주세요"
            />
          </label>
          <Link to="/register" className="signup-link">
            계정이 없으신가요? <span>회원가입 하러가기</span>
          </Link>
          <button type="submit" className="login-box">
            로그인
          </button>
        </div>
      </form>
    </LoginStyles>
  );
};

export default LoginPage;
