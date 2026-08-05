import { getImageUrl } from "../../api/instance";
import styles from "./chatStyles.js";

const DMHeader = ({
  targetUserId,
  targetProfileImg,
  targetNickname,
  targetOnline,
  setSelectedProfileId,
  notificationsMuted,
  toggleNotifications,
  setShowFileGallery,
  handleLeaveDM,
}) => (
  <div className={styles.header}>
    <button
      type="button"
      className={`${styles.headerThumb} ${styles.headerProfileButton}`}
      disabled={!targetUserId}
      onClick={() => setSelectedProfileId(targetUserId)}
      title="프로필 보기"
    >
      {targetProfileImg ? (
        <img
          src={getImageUrl(targetProfileImg)}
          alt="상대 프로필"
          className={styles.headerThumbImage}
          style={{ backgroundColor: "white" }}
        />
      ) : (
        <span className={styles.headerHashIcon}>DM</span>
      )}
    </button>
    <span
      className={styles.headerName}
      style={{ display: "flex", alignItems: "center", gap: 6 }}
    >
      {targetNickname || "사용자"}
      {targetOnline && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "#31c48d",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#31c48d",
              display: "inline-block",
            }}
          />
          온라인
        </span>
      )}
    </span>
    <div className={styles.headerDivider} />
    <span className={styles.headerDesc}>
      {targetNickname ? `${targetNickname}님과의 대화입니다.` : ""}
    </span>
    <div className={styles.headerActions}>
      <button
        type="button"
        className={styles.headerIconBtn}
        title={notificationsMuted ? "DM 알림 켜기" : "DM 알림 끄기"}
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
      <button
        type="button"
        className={styles.headerIconBtn}
        title="나가기"
        onClick={handleLeaveDM}
      >
        🚪
      </button>
    </div>
  </div>
);

export default DMHeader;
