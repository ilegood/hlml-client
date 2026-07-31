import { getImageUrl } from "../../api/instance";
import styles from "./chatStyles.js";

const ChatRoomHeader = ({
  roomImage,
  postData,
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
            <img src={getImageUrl(roomImage)} alt="room" />
          ) : (
            <span className={styles.headerHashIcon} style={{ fontSize: 22 }}>
              {postData &&
                (() => {
                  const CAT_MAP = {
                    게임: "🎮",
                    스터디: "📚",
                    운동: "🏃",
                    맛집: "🍽️",
                    여행: "✈️",
                    음악: "🎵",
                    영화: "🎬",
                    사진: "📷",
                    반려동물: "🐾",
                    독서: "📖",
                    언어: "💬",
                    취미: "🎨",
                    패션: "👗",
                    기타: "💡",
                  };
                  const cats = postData.categories || {};
                  const key = Object.keys(cats).find((k) => cats[k]);
                  return key && CAT_MAP[key] ? CAT_MAP[key] : "#";
                })()}
            </span>
          )}
        </div>
        <span className={styles.headerName}>
          {roomTitle || `채팅방 ${roomId}`}
        </span>
        <div className={styles.headerDivider} />
        <span className={styles.headerDesc}>
          {roomTitle ? `${roomTitle} 채팅방입니다.` : ""}
        </span>
        <div className={styles.headerActions}>
          {name === roomAuthor && (
            <button
              className={styles.headerIconBtn}
              title="방 설정 변경"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          )}
          <button
            className={styles.headerIconBtn}
            title={notificationsMuted ? "채팅 알림 켜기" : "채팅 알림 끄기"}
            onClick={toggleNotifications}
          >
            {notificationsMuted ? "🔕" : "🔔"}
          </button>
          <button
            className={styles.headerIconBtn}
            title="파일 모아보기"
            onClick={() => setShowFileGallery(true)}
          >
            📎
          </button>
          {roomLocation?.latitude && (
            <button
              className={styles.headerIconBtn}
              title="지도보기"
              onClick={openRoomMap}
            >
              🗺️
            </button>
          )}
          <button
            className={styles.headerIconBtn}
            title="멤버보기"
            onClick={toggleMembers}
          >
            👥
          </button>
          <button
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
