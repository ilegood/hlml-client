// import { useState } from "react";
import "./RegisterPage.css";

const RegisterPage = () => {
  return (
    <>
      <div class="header">회원가입</div>
      <div class="container">
        <form action="">
          <label>
            아이디
            <input type="text" class="id" placeholder="아이디를 입력해주세요" />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              class="pw"
              placeholder="비밀번호를 입력해주세요"
            />
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              class="pw_check"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </label>
          <label>
            이메일 주소
            <input type="email" class="email" placeholder="example@email.com" />
          </label>
          <label>
            휴대전화
            <input
              type="number"
              class="tel"
              placeholder="'-' 없이 숫자만 입력해주세요"
            />
          </label>
          <label>
            이름
            <input
              type="text"
              class="user_name"
              placeholder="이름을 입력해주세요"
            />
          </label>
          <label>
            닉네임
            <input
              type="text"
              class="nickname"
              placeholder="닉네임을 입력해주세요"
            />
          </label>
          <label>
            생년월일
            <input type="date" class="birth" />
          </label>
          <div class="button-wrap">
            <button type="reset">취소</button>
            <button type="submit">회원가입</button>
          </div>
          <a href="#">메인으로 돌아가기</a>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
