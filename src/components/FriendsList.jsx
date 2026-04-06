// import { Link } from "react-router-dom";
import styled from "styled-components";

const FriendsStyles = styled.div`
  border: 2px solid #eee;
  background-color: var(--color-bg);
  width: 300px;
  height: 97vh;
  padding: 30px;
  ul {
    list-style: none;
  }
`;

const FriendsList = () => {
  return (
    <>
      <FriendsStyles>
        <h3>친구 목록</h3>
        <form>
          <input type="text" placeholder="친구 검색" />
        </form>
        <ul className="online">
          <p>온라인</p>
          <li>ZZAP</li>
          <li>타코야끼</li>
          <li>존못</li>
          <li>밥</li>
        </ul>
        <ul className="offline">
          <p>오프라인</p>
          <li>하늘</li>
          <li>깍두기</li>
          <li>yuncee</li>
          <li>기즈여</li>
        </ul>
      </FriendsStyles>
    </>
  );
};

export default FriendsList;
