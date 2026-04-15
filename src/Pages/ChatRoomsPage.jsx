import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";

const ChatRoomsStyles = styled.div`
  /* ... (Existing styles remain the same) ... */
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
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  // 서버에서 실제 방 목록 가져오기
  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/rooms");
      const data = await response.json();
      setChatRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async () => {
    if (newRoomName.trim() === "") {
      alert("채팅방 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newRoomName }),
      });

      if (response.ok) {
        setNewRoomName("");
        fetchRooms(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`방 생성 실패: ${errorData.message || "알 수 없는 오류"}`);
        console.error("Server Error:", errorData);
      }
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
      console.error("Failed to add room:", error);
    }
  };

  return (
    <ChatRoomsStyles>
      <div className="chat-rooms-header">
        <h2>실시간 채팅방 목록</h2>
      </div>

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
          }}
        >
          방 생성
        </button>
      </div>

      <div className="chat-room-list">
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <Link
              to={`/chat/${room.id}`}
              className="chat-room-item"
              key={room.id}
            >
              <div className="room-avatar"></div>
              <div className="room-info">
                <div className="room-name">{room.title}</div>
                <div className="last-message">클릭하여 대화에 참여하세요</div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>
            생성된 채팅방이 없습니다. 방을 만들어보세요!
          </div>
        )}
      </div>
    </ChatRoomsStyles>
  );
};

export default ChatRoomsPage;
