import { useState } from "react";
import styled from "styled-components";
import friendsData from "../api/friendsData";
import FriendModal from "./FriendModal";

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

  img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: red;
  }

  input {
    margin: 10px 0 20px;
    padding: 10px 20px;
    width: 100%;
    outline: none;
    border-radius: 50px;
    border: 1px solid #ccc;
  }

  input:focus {
    border-color: black;
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
    width: 100%;
    list-style: none;
  }

  li {
    border: 1px solid #ccc;
    width: 100%;
    padding: 10px 15px;
    border-radius: 10px;
    margin: 5px 0;

    display: flex;
    align-items: center;
    gap: 10px;
  }

  li:hover {
    border: 1px solid var(--color-deactive);
  }
`;

const FriendsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const onlineFriends = friendsData.filter((f) => f.status === "online");
  const offlineFriends = friendsData.filter((f) => f.status === "offline");

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
          <ul>
            {onlineFriends.map((friend) => (
              <li key={friend.id} onClick={() => setSelectedFriend(friend)}>
                <img src="" alt="" />
                {friend.name}
              </li>
            ))}
          </ul>

          <span>오프라인</span>
          <ul>
            {offlineFriends.map((friend) => (
              <li key={friend.id} onClick={() => setSelectedFriend(friend)}>
                <img src="" alt="" />
                {friend.name}
              </li>
            ))}
          </ul>

          {selectedFriend && (
            <FriendModal
              friend={selectedFriend}
              onClose={() => setSelectedFriend(null)}
            />
          )}
        </>
      )}
    </FriendsStyles>
  );
};

export default FriendsList;
