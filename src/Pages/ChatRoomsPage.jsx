import { Link } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";

const ChatRoomsStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 25px);
  padding: 20px;
  background-color: var(--color-bg);

  .chat-rooms-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    h2 {
      margin: 0;
      color: var(--color-active);
    }
  }

  .chat-room-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .chat-room-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    text-decoration: none;
    color: var(--color-text);
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .room-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--color-deactive);
      margin-right: 15px;
      flex-shrink: 0;
    }

    .room-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .room-name {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .last-message {
      font-size: 13px;
      color: #888;
    }
  }
`;

const ChatRoomsPage = () => {
  const [chatRooms, setChatRooms] = useState([
    { id: "1", name: "친구와 대화", lastMessage: "안녕하세요! 잘 지내시죠?" },
    { id: "2", name: "그룹 채팅방", lastMessage: "오늘 저녁에 만날까요?" },
    { id: "3", name: "새로운 친구", lastMessage: "반갑습니다!" },
    { id: "4", name: "스터디 그룹", lastMessage: "다음 스터디는 언제인가요?" },
    { id: "5", name: "가족 채팅", lastMessage: "어머니 생신 축하드려요!" },
  ]);
  const [newRoomName, setNewRoomName] = useState("");

  const handleAddRoom = () => {
    if (newRoomName.trim() === "") {
      alert("채팅방 이름을 입력해주세요.");
      return;
    }

    const newRoom = {
      id: String(Date.now()), // 임시로 현재 시간을 ID로 사용
      name: newRoomName,
      lastMessage: "새로운 채팅방이 생성되었습니다.",
    };

    setChatRooms((prevRooms) => [...prevRooms, newRoom]);
    setNewRoomName(""); // 입력 필드 초기화
  };

  return (
    <ChatRoomsStyles>
      <div className="chat-rooms-header">
        <h2>
          채팅방 목록(베타버전 현재 my SQL은 없습니다. 임의적으로 만든
          방들입니다)
        </h2>
      </div>

      {/* 새로운 채팅방 추가 UI */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="새로운 채팅방 이름"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
          }}
        />
        <button
          onClick={handleAddRoom}
          style={{
            backgroundColor: "var(--color-active)",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "opacity 0.2s",
          }}
        >
          추가
        </button>
      </div>

      <div className="chat-room-list">
        {chatRooms.map((room) => (
          <Link
            to={`/chat/${room.id}`}
            className="chat-room-item"
            key={room.id}
          >
            <div className="room-avatar"></div>
            <div className="room-info">
              <div className="room-name">{room.name}</div>
              <div className="last-message">{room.lastMessage}</div>
            </div>
          </Link>
        ))}
      </div>
    </ChatRoomsStyles>
  );
};

export default ChatRoomsPage;
