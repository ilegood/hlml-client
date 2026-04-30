import { Link } from "react-router-dom";
import styles from "./ChatRoomItem.module.css";

const ChatRoomItem = ({ room, onDelete, currentUserName }) => {
  return (
    <div className={styles.chatRoomItem}>
      <Link to={`/chat/${room.id}`} className={styles.roomLink}>
        <div className={styles.roomAvatar}></div>
        <div className={styles.roomInfo}>
          <div className={styles.roomName}>{room.title}</div>
          <div className={styles.lastMessage}>
            {room.author ? `방장: ${room.author}` : "클릭하여 대화에 참여하세요"}
          </div>
        </div>
      </Link>
      {currentUserName === room.author && (
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(room)}
        >
          삭제
        </button>
      )}
    </div>
  );
};

export default ChatRoomItem;
