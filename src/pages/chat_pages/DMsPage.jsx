import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { getImageUrl } from "../../api/instance";
import instance from "../../api/instance";
import styles from "./ChatRoomsPage.module.css";
import itemStyles from "../../components/chat_components/ChatRoomItem.module.css";

const mediaLabelByMime = (mimeType) => {
  if (mimeType?.startsWith("image/")) return "이미지를 보냈습니다.";
  if (mimeType?.startsWith("video/")) return "동영상을 보냈습니다.";
  return "파일을 보냈습니다.";
};

const mediaLabelByAttachment = (attachment) => {
  if (attachment?.resourceType === "image") return "이미지를 보냈습니다.";
  if (attachment?.resourceType === "video") return "동영상을 보냈습니다.";
  return mediaLabelByMime(attachment?.mimeType);
};

const formatLastMessage = (content) => {
  if (!content) return "아직 대화 내용이 없습니다.";

  try {
    const parsed = JSON.parse(content);
    const attachments =
      parsed?.kind === "chat_payload" && Array.isArray(parsed.attachments)
        ? parsed.attachments
        : parsed?.kind === "chat_attachment"
          ? [parsed]
          : [];
    const text = parsed?.text?.trim();

    if (attachments.length === 0) return text || content;

    const label = mediaLabelByAttachment(attachments[0]);
    return text ? `${text} · ${label}` : label;
  } catch {
    return content;
  }
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
};

const isMuted = (roomId) => localStorage.getItem(`dm-muted:${roomId}`) === "1";

const DMsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { summary, refresh } = useChatNotifications() || {};
  const [dms, setDms] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadByRoomId = useMemo(
    () =>
      new Map(
        (summary?.rooms?.dms || []).map((room) => [
          String(room.roomId),
          room.unreadCount || 0,
        ]),
      ),
    [summary?.rooms?.dms],
  );

  useEffect(() => {
    const fetchDMs = async () => {
      try {
        const res = await instance.get("/chat/dm");
        setDms(res.data);
        refresh?.();
      } catch (err) {
        console.error("DM 목록 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDMs();
    }
  }, [userId, refresh]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>개인 메시지</h2>
      </div>

      <div className={styles.chatRoomList}>
        {loading ? (
          <div className={styles.empty}>메시지를 불러오는 중...</div>
        ) : dms.length > 0 ? (
          dms.map((dm) => {
            const roomKey = String(dm.roomId);
            const muted = isMuted(roomKey);
            const unreadCount = unreadByRoomId.has(roomKey)
              ? unreadByRoomId.get(roomKey)
              : dm.unreadCount || 0;
            const displayUnreadCount = muted ? 0 : unreadCount;

            return (
              <div
                key={dm.roomId}
                className={itemStyles.chatRoomItem}
                onClick={() => navigate(`/dms/${dm.roomId}`)}
                style={{ cursor: "pointer" }}
              >
              <div
                className={itemStyles.roomAvatar}
                style={{
                  backgroundImage: dm.targetProfileImg
                    ? `url(${getImageUrl(dm.targetProfileImg)})`
                    : "none",
                }}
              >
                {!dm.targetProfileImg && (
                  <div className={itemStyles.noImage}></div>
                )}
              </div>

              <div className={itemStyles.roomInfo}>
                <div className={itemStyles.roomName}>{dm.targetNickname}</div>
                <div className={itemStyles.lastMessage}>
                  {formatLastMessage(dm.lastMessage)}
                </div>
              </div>

              <div className={itemStyles.appointmentInfo}>
                <div className={itemStyles.dateTime}>
                  {dm.lastMessageTime && formatTime(dm.lastMessageTime)}
                </div>
                {displayUnreadCount > 0 && (
                  <span className={itemStyles.unreadBadge}>
                    {displayUnreadCount > 99
                      ? "99+"
                      : displayUnreadCount}
                  </span>
                )}
              </div>
            </div>
            );
          })
        ) : (
          <div className={styles.empty}>
            진행 중인 대화가 없습니다.
            <br />
            친구 목록에서 메시지를 보내보세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default DMsPage;
