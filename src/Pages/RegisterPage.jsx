import { Link } from "react-router-dom";
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

  input,
  select {
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

  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
    cursor: pointer;
  }

  input::placeholder {
    color: #bbb;
    font-size: 12px;
  }

  input:focus {
    border-color: var(--color-active);
    background-color: #fff8f2;
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
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <RegisterStyled>
      <form>
        <div className="container">
          <label>
            아이디
            <input
              type="text"
              className="id"
              placeholder="아이디를 입력해주세요"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              className="pw"
              placeholder="비밀번호를 입력해주세요"
            />
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              className="pw_check"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </label>
          <label>
            이메일 주소
            <input
              type="email"
              className="email"
              placeholder="example@email.com"
            />
          </label>
          <label>
            휴대전화
            <input
              type="tel"
              className="tel"
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
          </label>
          <label>
            이름
            <input
              type="text"
              className="user_name"
              placeholder="이름을 입력해주세요"
            />
          </label>
          <label>
            닉네임
            <input
              type="text"
              className="nickname"
              placeholder="닉네임을 입력해주세요"
            />
          </label>
          <label>
            생년월일
            <div className="birth-wrap">
              <select className="birth-year" defaultValue="">
                <option value="" disabled>
                  년
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select className="birth-month" defaultValue="">
                <option value="" disabled>
                  월
                </option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select className="birth-day" defaultValue="">
                <option value="" disabled>
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

          <div className="button-wrap">
            <button type="reset" className="btn-cancel">
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
