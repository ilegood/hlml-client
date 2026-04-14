import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const MainStyles = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 25px); /* Header 높이 제외 */
  gap: 20px;

  h1 {
    font-size: 40px;
    color: var(--color-active);
  }

  .links {
    display: flex;
    gap: 15px;
  }

  a {
    text-decoration: none;
    color: var(--color-text);
    padding: 10px 20px;
    border: 1.5px solid #ddd;
    border-radius: 50px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--color-active);
      color: var(--color-active);
      background-color: #fff8f2;
    }
  }
`;

const MainPage = () => {
  return (
    <MainStyles>
      <h1>우와웅</h1>
      <div className="links">
        <Link to="/register">회원가입</Link>
        <Link to="/login">로그인</Link>
        <Link to="/user">마이페이지</Link>
      </div>
    </MainStyles>
  );
};

export default MainPage;
