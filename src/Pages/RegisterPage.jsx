import { Link } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  return (
    <>
      <div className="section">
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
      </div>
    </>
  );
};

export default RegisterPage;
