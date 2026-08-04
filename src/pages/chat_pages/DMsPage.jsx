<<<<<<< Updated upstream
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { BASE_URL, getImageUrl } from "../../api/instance";
import { getDmRooms } from "../../api/chat";
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
    if (parsed?.kind === "share_post") {
      const sharer = parsed.sharerNickname || "알 수 없음";
      const title = parsed.postTitle || "게시글";
      return `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
    }

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
      hourCycle: "h23",
    });
  }

  const options = {
    month: "2-digit",
    day: "2-digit",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("ko-KR", options);
};

const DMsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { summary, refresh } = useChatNotifications() || {};
  const [dms, setDms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const onlineSocketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(BASE_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    onlineSocketRef.current = socket;

    socket.emit("get_online_friends", (friendIds) => {
      setOnlineUsers(new Set(friendIds.map(Number)));
    });

    socket.on("friend_online_status", ({ userId: friendId, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(Number(friendId));
        else next.delete(Number(friendId));
        return next;
      });
    });

    return () => socket.disconnect();
  }, [userId]);

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
        setDms(await getDmRooms());
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
=======
import { getImageUrl } from "../../api/instance";
import itemStyles from "../../components/chat_components/chatStyles.js";
import {
  formatDMTime as formatTime,
  formatLastMessage,
  useDMList,
} from "../../hooks/useDMList";
const DMsPage = () => {
  const { dms, loading, onlineUsers, openDMRoom, unreadByRoomId } = useDMList();
>>>>>>> Stashed changes

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
            const unreadCount = unreadByRoomId.has(roomKey)
              ? unreadByRoomId.get(roomKey)
              : dm.unreadCount || 0;

            return (
              <div
                key={dm.roomId}
                className={itemStyles.chatRoomItem}
                onClick={() => openDMRoom(dm.roomId)}
                style={{ cursor: "pointer" }}
              >
              <div style={{ position: "relative" }}>
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
                {onlineUsers.has(Number(dm.targetId)) && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#31c48d",
                    border: "2px solid var(--color-bg, #1a1a2e)",
                  }} />
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
                {unreadCount > 0 && (
                  <span className={itemStyles.unreadBadge}>
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
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
