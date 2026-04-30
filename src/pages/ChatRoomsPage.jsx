import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import ChatRoomItem from "../components/ChatRoomItem";
import styles from "./ChatRoomsPage.module.css";

const SERVER_URL = `http://${window.location.hostname}:4000`;

const ChatRoomsPage = () => {
  const { token, name } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

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
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (newRoomName.trim() === "") {
      alert("채팅방 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/rooms`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newRoomName,
          author: name || "익명",
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ author: name }),
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>실시간 채팅방 목록</h2>
      </div>

      <div className={styles.createRoom}>
        <input
          type="text"
          placeholder="새로운 채팅방 이름"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button className={styles.primaryButton} onClick={handleAddRoom}>
          방 생성
        </button>
      </div>

      <div className={styles.chatRoomList}>
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <ChatRoomItem 
              key={room.id} 
              room={room} 
              onDelete={handleDeleteRoom}
              currentUserName={name}
            />
          ))
        ) : (
          <div className={styles.empty}>
            생성된 채팅방이 없습니다. 방을 만들어보세요!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
