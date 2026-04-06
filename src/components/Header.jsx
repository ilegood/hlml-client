// import { Link } from "react-router-dom";
import styled from "styled-components";

const HeaderStyles = styled.div`
  display: flex;
  justify-content: center;

  width: 100%;
  height: 25px;
  background-color: var(--color-deactive);
  color: white;
`;

const Header = () => {
  return (
    <>
      <HeaderStyles>회원가입</HeaderStyles>
    </>
  );
};

export default Header;
