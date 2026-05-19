import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styles from "./ChatRoomItem.module.css";

const ChatRoomItem = ({ room, onDelete, hideUnreadBadge = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return String(timeStr).slice(0, 5);
  };

  const handleClick = () => {
    if (room.isKicked) {
      toast.error("강퇴된 채팅방에는 입장할 수 없습니다.");
      return;
    }
    navigate(`/chat-rooms/${room.post_id || room.id}`);
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
        {!room.image && <div className={styles.noImage} />}
      </div>

      <div className={styles.roomInfo}>
        <div className={styles.roomName}>
          {room.title || "제목 없음"}
          {room.isKicked && <span className={styles.kickedBadge}>강퇴됨</span>}
        </div>
        <div className={styles.lastMessage}>
          방장: {room.authorNickname || room.author || "이름 없음"}
        </div>
      </div>

      <div className={styles.appointmentInfo}>
        <div className={styles.dateTime}>
          {room.date && formatDate(room.date)}
          {room.date && room.time && " / "}
          {room.time && formatTime(room.time)}
        </div>
        <div className={styles.place}>{room.place || ""}</div>
        {!hideUnreadBadge && room.unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        )}
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
