import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";

const RegisterStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 25px);
  padding: 40px 0;

  .container {
    display: flex;
    flex-direction: column;
    width: 480px;
    background-color: var(--color-bg);
    border-radius: 16px;
    padding: 40px 36px 32px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 10px;
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

  .button-wrap {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-cancel,
  .btn-submit {
    flex: 1;
    height: 45px;
    border-radius: 50px;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-cancel {
    background-color: #f0f0f0;
    color: #888;
  }
  .btn-submit {
    background-color: var(--color-active);
    color: white;
  }

  .back-link {
    display: block;
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: #aaa;
    text-decoration: none;
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    passwordCheck: "",
    nickname: "",
    email: "",
    birthday: "",
    gender: "남",
    phone_number: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:4000/api/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();
      if (data.success) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <RegisterStyled>
      <form onSubmit={handleSubmit}>
        <div className="container">
          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력해주세요"
            />
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              name="passwordCheck"
              value={formData.passwordCheck}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </label>
          <label>
            닉네임
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              placeholder="채팅에서 사용할 닉네임"
            />
          </label>
          <label>
            이메일
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </label>
          <label>
            생년월일
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            성별
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{
                marginTop: "5px",
                height: "40px",
                borderRadius: "50px",
                padding: "0 15px",
                border: "1.5px solid #d3d3d3",
              }}
            >
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </label>
          <label>
            전화번호
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              placeholder="010-0000-0000"
            />
          </label>
          <label>
            주소
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="주소를 입력해주세요"
            />
          </label>

          <div className="button-wrap">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-cancel"
            >
              취소
            </button>
            <button type="submit" className="btn-submit">
              회원가입
            </button>
          </div>
          <Link to="/" className="back-link">
            메인으로 돌아가기
          </Link>
        </div>
      </form>
    </RegisterStyled>
  );
};

export default RegisterPage;
