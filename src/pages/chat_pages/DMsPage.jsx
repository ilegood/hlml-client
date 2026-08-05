import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { BASE_URL, getImageUrl } from "../../api/instance";
import instance from "../../api/instance";

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
    <div className="mx-auto flex min-h-[calc(100vh-25px)] max-w-[900px] flex-col bg-[var(--color-bg)] p-5">
      <div className="mb-[25px] border-b border-[var(--color-border)] pb-[15px]">
        <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-active)]">개인 메시지</h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-[5px] pb-[30px] pt-[5px]">
        {loading ? (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">메시지를 불러오는 중...</div>
        ) : dms.length > 0 ? (
          dms.map((dm) => {
            const roomKey = String(dm.roomId);
            const unreadCount = unreadByRoomId.has(roomKey)
              ? unreadByRoomId.get(roomKey)
              : dm.unreadCount || 0;

            return (
              <div
                key={dm.roomId}
                className={"[display:flex] [align-items:center] [gap:20px] [padding:24px] [min-height:110px] [background-color:var(--color-sidebar)] [border-radius:20px] [box-shadow:0_4px_15px_rgba(0,_0,_0,_0.05)] [color:var(--color-text)] [transition:all_0.3s_ease] [border:2px_solid_var(--color-border)] [cursor:pointer] hover:[transform:translateY(-4px)] hover:[box-shadow:0_8px_25px_rgba(253,_147,_25,_0.1)] hover:[border-color:var(--color-active)]"}
                onClick={() => navigate(`/dms/${dm.roomId}`)}
                style={{ cursor: "pointer" }}
              >
              <div style={{ position: "relative" }}>
                <div
                  className={"[width:70px] [height:70px] [border-radius:18px] [flex-shrink:0] [background-size:cover] [background-position:center] [overflow:hidden] [border:1px_solid_var(--color-border)]"}
                  style={{
                    backgroundImage: dm.targetProfileImg
                      ? `url(${getImageUrl(dm.targetProfileImg)})`
                      : "none",
                  }}
                >
                  {!dm.targetProfileImg && (
                    <div className={"[width:100%] [height:100%] [background:linear-gradient(135deg,_var(--color-active)_0%,_#ffb35c_100%)] [opacity:0.2]"}></div>
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

              <div className={"[flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:4px]"}>
                <div className={"[font-weight:800] [font-size:17px] [color:var(--color-text)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]"}>{dm.targetNickname}</div>
                <div className={"[font-size:14px] [color:var(--color-deactive)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis] [opacity:0.8]"}>
                  {formatLastMessage(dm.lastMessage)}
                </div>
              </div>

              <div className={"[display:flex] [flex-direction:column] [align-items:flex-end] [gap:4px] [min-width:120px] [flex-shrink:0]"}>
                <div className={"[font-size:14px] [font-weight:700] [color:var(--color-active)]"}>
                  {dm.lastMessageTime && formatTime(dm.lastMessageTime)}
                </div>
                {unreadCount > 0 && (
                  <span className={"[min-width:22px] [height:22px] [padding:0_7px] [border-radius:999px] [background:#ff4757] [color:white] [font-size:12px] [font-weight:800] [line-height:22px] [text-align:center] [align-self:flex-end]"}>
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
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
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
