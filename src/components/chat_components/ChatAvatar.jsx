import { getImageUrl } from "../../api/instance";
import borderImg from "../../assets/border.png";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";
import { displayName } from "../../utils/chatHelpers";

export default function ChatAvatar({
  profileImg,
  nickname,
  isHost = false,
  size = 40,
  onClick,
  className = "",
}) {
  const url = getImageUrl(profileImg);
  const label = displayName(nickname);

  const avatar = (
    <div
      className={`${styles.msgAvatar} ${className}`}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {url ? <img src={url} alt={label} /> : label.slice(0, 2)}
    </div>
  );

  if (!isHost) return avatar;

  return (
    <div
      className={styles.avatarWrapSmall}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <img src={borderImg} className={styles.avatarBorderSmall} alt="" />
      <div
        className={styles.msgAvatar}
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        {url ? (
          <img src={url} alt={label} style={{ backgroundColor: "white" }} />
        ) : (
          label.slice(0, 2)
        )}
      </div>
    </div>
  );
}
