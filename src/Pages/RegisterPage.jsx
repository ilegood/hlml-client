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

  input::placeholder {
    color: #bbb;
    font-size: 12px;
  }

  input:focus {
    border-color: var(--color-active);
    background-color: #fff8f2;
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
            <input type="date" className="birth" />
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
