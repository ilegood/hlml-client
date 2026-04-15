import styled from "styled-components";

const HeaderStyles = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 25px;
  background-color: var(--color-deactive, #888);
  color: white;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.3px;
`;

const Header = () => {
  return (
    <HeaderStyles>
      회원가입
    </HeaderStyles>
  );
};

export default Header;
