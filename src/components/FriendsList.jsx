import { useState } from "react";
import styled from "styled-components";

const FriendsStyles = styled.div`
  border: 2px solid #eee;
  background-color: var(--color-bg);
  width: ${({ $isOpen }) => ($isOpen ? "300px" : "70px")};
  padding: 30px;
  transition: 0.2s ease;

  position: sticky;
  right: 0;
  top: 0;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  input {
    margin: 10px 0 20px;
    padding: 10px 20px;
    width: 100%;
    border-radius: 50px;
    border: 1px solid #ccc;
  }

  span {
    width: 100%;
    font-size: 18px;
    font-weight: 500;
    border-top: 2px solid #ccc;
    padding: 20px 0;
    margin-top: 10px;
  }

  ul {
    list-style: none;
  }
`;

const FriendsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  return (
    <FriendsStyles $isOpen={isOpen}>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "닫기" : "열기"}
      </button>
      {isOpen && (
        <>
          <h2>친구목록</h2>
          <input type="text" placeholder="친구 검색" />

          <span>온라인</span>
          <ul></ul>

          <span>오프라인</span>
          <ul></ul>
        </>
      )}
    </FriendsStyles>
  );
};

export default FriendsList;
