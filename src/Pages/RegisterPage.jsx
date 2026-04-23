import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styled from "styled-components";

const RegisterStyled = styled.div`
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

  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 22px;
    gap: 8px;
  }

  input,
  select {
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

  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
    cursor: pointer;
    color: var(--color-text);
  }

  input::placeholder {
    color: #888;
    font-size: 12px;
  }

  input:focus {
    border-color: var(--color-active);
    background-color: var(--color-input-focus-bg);
  }

  .birth-wrap {
    display: flex;
    gap: 10px;
    margin-top: 5px;
  }

  .birth-wrap select {
    margin-top: 0;
    flex: 1;
  }

  .gender-wrap {
    display: flex;
    gap: 10px;
    margin-top: 5px;
  }

  .gender-option {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 45px;
    border: 1.5px solid var(--color-border);
    background-color: var(--color-input-bg);
    color: var(--color-text);
    border-radius: 8px;
    font-weight: normal;
    cursor: pointer;
    margin-bottom: 0;
    transition: all 0.2s;

    &:has(input:checked) {
      border-color: var(--color-active);
      background-color: var(--color-input-focus-bg);
      color: var(--color-active);
      font-weight: 600;
    }
  }

  .gender-option input {
    display: none;
  }

  .button-wrap {
    display: flex;
    gap: 10px;
    margin-top: 10px;
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
    transition:
      opacity 0.2s,
      transform 0.1s;
  }

  .btn-cancel {
    background-color: #f0f0f0;
    color: #888;
  }

  .btn-submit {
    background-color: var(--color-active);
    color: white;
  }

  .btn-cancel:hover,
  .btn-submit:hover {
    opacity: 0.85;
  }

  .btn-cancel:active,
  .btn-submit:active {
    transform: scale(0.98);
  }

  .back-link {
    display: block;
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: #aaa;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--color-active);
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    pw_check: "",
    phone_number: "",
    gender: "",
    birthday: { year: "", month: "", day: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBirthChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      birthday: { ...prev.birthday, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nickname) return toast.error("닉네임을 입력해주세요.");
    if (!form.email) return toast.error("이메일 주소를 입력해주세요.");
    if (!form.password) return toast.error("비밀번호를 입력해주세요.");
    if (!form.pw_check) return toast.error("비밀번호 확인을 입력해주세요.");
    if (form.password !== form.pw_check) return toast.error("비밀번호가 일치하지 않습니다.");
    if (!form.phone_number) return toast.error("휴대전화 번호를 입력해주세요.");
    if (!form.birthday.year || !form.birthday.month || !form.birthday.day) {
      return toast.error("생년월일을 모두 선택해주세요.");
    }
    if (!form.gender) return toast.error("성별을 선택해주세요.");

    const body = {
      nickname: form.nickname,
      email: form.email,
      password: form.password,
      phone_number: form.phone_number,
      gender: form.gender,
      birthday: `${form.birthday.year}-${form.birthday.month}-${form.birthday.day}`,
    };

    try {
      const res = await fetch("http://localhost:4000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("회원가입 완료! 로그인해 주세요.");
        navigate("/login");
      } else {
        toast.error(data.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const handleReset = () => {
    setForm({
      nickname: "",
      email: "",
      password: "",
      pw_check: "",
      phone_number: "",
      gender: "",
      birthday: { year: "", month: "", day: "" },
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <RegisterStyled>
      <form onSubmit={handleSubmit}>
        <div className="container">
          <label>
            닉네임
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력해주세요"
            />
          </label>
          <label>
            이메일 주소
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
            />
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              name="pw_check"
              value={form.pw_check}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </label>
          <label>
            휴대전화
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
          </label>
          <label>
            생년월일
            <div className="birth-wrap">
              <select
                name="year"
                value={form.birthday.year}
                onChange={handleBirthChange}
              >
                <option value="">
                  년
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                name="month"
                value={form.birthday.month}
                onChange={handleBirthChange}
              >
                <option value="">
                  월
                </option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                name="day"
                value={form.birthday.day}
                onChange={handleBirthChange}
              >
                <option value="">
                  일
                </option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label>
            성별
            <div className="gender-wrap">
              {["남", "여"].map((g) => (
                <label key={g} className="gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g}
                </label>
              ))}
            </div>
          </label>

          <div className="button-wrap">
            <button type="button" className="btn-cancel" onClick={handleReset}>
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
