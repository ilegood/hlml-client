import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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

  .create-room {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    padding: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .create-room input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
  }

  .primary-button,
  .delete-button {
    border: none;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .primary-button {
    background-color: var(--color-active);
    color: white;
  }

  .delete-button {
    background-color: #f2f2f2;
    color: #d9363e;
    flex-shrink: 0;
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
    gap: 12px;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    color: var(--color-text);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .chat-room-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .room-link {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    text-decoration: none;
    color: inherit;
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
    min-width: 0;
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
`;

const SERVER_URL = `http://${window.location.hostname}:4000`;

const ChatRoomsPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/rooms`);
      const data = await response.json();
      setChatRooms(Array.isArray(data) ? data : []);
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
      const response = await fetch(`${SERVER_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRoomName,
          author: user?.nickname || "익명",
        }),
      });

      if (response.ok) {
        setNewRoomName("");
        fetchRooms();
      } else {
        const errorData = await response.json();
        alert(`방 생성 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`'${room.title}' 채팅방을 삭제할까요?`)) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/rooms/${room.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: user?.nickname }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "채팅방 삭제에 실패했습니다.");
        return;
      }

      fetchRooms();
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <ChatRoomsStyles>
      <div className="chat-rooms-header">
        <h2>실시간 채팅방 목록</h2>
      </div>

      <div className="create-room">
        <input
          type="text"
          placeholder="새로운 채팅방 이름"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button className="primary-button" onClick={handleAddRoom}>
          방 생성
        </button>
      </div>

      <div className="chat-room-list">
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <div className="chat-room-item" key={room.id}>
              <Link to={`/chat/${room.id}`} className="room-link">
                <div className="room-avatar"></div>
                <div className="room-info">
                  <div className="room-name">{room.title}</div>
                  <div className="last-message">
                    {room.author ? `방장: ${room.author}` : "클릭하여 대화에 참여하세요"}
                  </div>
                </div>
              </Link>
              {user?.nickname === room.author && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteRoom(room)}
                >
                  삭제
                </button>
              )}
            </div>
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
