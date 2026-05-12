import { useNavigate } from "react-router-dom";
import styles from "./ChatRoomItem.module.css";

const ChatRoomItem = ({ room, onDelete }) => {
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

  const handleClick = () => {
    if (room.isKicked) {
      alert("강퇴당한 채팅방에는 입장할 수 없습니다.");
      return;
    }
    navigate(`/chat-rooms/${room.post_id}`);
  };

  return (
    <div
      className={`${styles.chatRoomItem} ${room.isKicked ? styles.kicked : ""}`}
      onClick={handleClick}
      style={{ cursor: room.isKicked ? "default" : "pointer" }}
    >
      <div
        className={styles.roomAvatar}
        style={{ backgroundImage: room.image ? `url(${room.image})` : "none" }}
      >
        {!room.image && <div className={styles.noImage}></div>}
      </div>

      <div className={styles.roomInfo}>
        <div className={styles.roomName}>
          {room.title}
          {room.isKicked && <span className={styles.kickedBadge}>강퇴됨</span>}
        </div>
        <div className={styles.lastMessage}>방장: {room.author}</div>
      </div>

      <div className={styles.appointmentInfo}>
        <div className={styles.dateTime}>
          {room.date && formatDate(room.date)}
          {room.date && room.time && " / "}
          {room.time && formatTime(room.time)}
        </div>
        <div className={styles.place}>{room.place || ""}</div>
      </div>

      {onDelete && (
        <button 
          className={styles.deleteBtn} 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="목록에서 삭제"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ChatRoomItem;
