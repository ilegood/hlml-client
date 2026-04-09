import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const MainStyles = styled.div``;

const MainPage = () => {
  return (
    <MainStyles>
      <h1>우와웅</h1>
      <Link to="/register">회원가입</Link>
      <Link to="/login">로그인</Link>
      <Link to="/user">마이페이지</Link>
      <Link to="/chatrooms">채팅방 바로가기</Link>
    </MainStyles>
  );
};

export default MainPage;
