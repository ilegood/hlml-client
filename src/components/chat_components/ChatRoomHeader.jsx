import { getImageUrl } from "../../api/instance";
import styles from "./chatStyles.js";

const ChatRoomHeader = ({
  roomImage,
  roomTitle,
  roomId,
  roomAuthor,
  name,
  roomLocation,
  setShowSettings,
  notificationsMuted,
  toggleNotifications,
  setShowFileGallery,
  openRoomMap,
  toggleMembers,
  handleLeave,
}) => (
  <div className={styles.header}>
    <div className={styles.headerThumb}>
      {roomImage ? (
        <img src={getImageUrl(roomImage)} alt="채팅방" />
      ) : (
        <span className={styles.headerHashIcon} style={{ fontSize: 22 }}>
          #
        </span>
      )}
    </div>
    <span className={styles.headerName}>{roomTitle || `채팅방 ${roomId}`}</span>
    <div className={styles.headerDivider} />
    <span className={styles.headerDesc}>
      {roomTitle ? `${roomTitle} 채팅방입니다.` : ""}
    </span>
    <div className={styles.headerActions}>
      {name === roomAuthor && (
        <button
          type="button"
          className={styles.headerIconBtn}
          title="방 설정 변경"
          onClick={() => setShowSettings(true)}
        >
          설정
        </button>
      )}
      <button
        type="button"
        className={styles.headerIconBtn}
        title={notificationsMuted ? "채팅 알림 켜기" : "채팅 알림 끄기"}
        onClick={toggleNotifications}
      >
        {notificationsMuted ? "🔕" : "🔔"}
      </button>
      <button
        type="button"
        className={styles.headerIconBtn}
        title="파일 모아보기"
        onClick={() => setShowFileGallery(true)}
      >
        📎
      </button>
      {roomLocation?.latitude && (
        <button
          type="button"
          className={styles.headerIconBtn}
          title="지도 보기"
          onClick={openRoomMap}
        >
          🗺️
        </button>
      )}
      <button
        type="button"
        className={styles.headerIconBtn}
        title="멤버 보기"
        onClick={toggleMembers}
      >
        👥
      </button>
      <button
        type="button"
        className={styles.headerIconBtn}
        title="나가기"
        onClick={handleLeave}
      >
        🚪
      </button>
    </div>
  </div>
);

export default ChatRoomHeader;
