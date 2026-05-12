import { useNavigate } from "react-router-dom";
import styles from "./ChatRoomItem.module.css";

const ChatRoomItem = ({ room }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5);
  };

  return (
    <div
      className={styles.chatRoomItem}
      onClick={() => navigate(`/chat-rooms/${room.post_id}`)}
      style={{ cursor: "pointer" }}
    >
      <div
        className={styles.roomAvatar}
        style={{ backgroundImage: room.image ? `url(${room.image})` : "none" }}
      >
        {!room.image && <div className={styles.noImage}></div>}
      </div>

      <div className={styles.roomInfo}>
        <div className={styles.roomName}>{room.title}</div>
        <div className={styles.lastMessage}>방장: {room.authorNickname}</div>
      </div>

      <div className={styles.appointmentInfo}>
        <div className={styles.dateTime}>
          {room.date && formatDate(room.date)}
          {room.date && room.time && " / "}
          {room.time && formatTime(room.time)}
        </div>
        <div className={styles.place}>{room.place || ""}</div>
      </div>
    </div>
  );
};

export default ChatRoomItem;
