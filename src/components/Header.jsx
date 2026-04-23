import { useLocation } from "react-router-dom";
import styled from "styled-components";

const HeaderStyles = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 25px;
  background-color: var(--color-deactive);
  color: white;
  font-size: 13px;
  font-weight: 500;
`;

const Header = () => {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case "/login":
        return "로그인";
      case "/register":
        return "회원가입";
      case "/user":
        return "마이페이지";
      default:
        return "할래말래";
    }
  };

  return (
    <HeaderStyles>
      {getTitle()}
    </HeaderStyles>
  );
};

export default Header;
