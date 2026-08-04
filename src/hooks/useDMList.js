import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { BASE_URL } from "../api/instance";
import instance from "../api/instance";
import { useAuth } from "../context/AuthContext.jsx";
import { useChatNotifications } from "../context/ChatNotificationContext";

export const mediaLabelByMime = (mimeType) => {
  if (mimeType?.startsWith("image/")) return "이미지를 보냈습니다.";
  if (mimeType?.startsWith("video/")) return "동영상을 보냈습니다.";
  return "파일을 보냈습니다.";
};

export const mediaLabelByAttachment = (attachment) => {
  if (attachment?.resourceType === "image") return "이미지를 보냈습니다.";
  if (attachment?.resourceType === "video") return "동영상을 보냈습니다.";
  return mediaLabelByMime(attachment?.mimeType);
};

export const formatLastMessage = (content) => {
  if (!content) return "아직 대화 내용이 없습니다.";

  try {
    const parsed = JSON.parse(content);
    if (parsed?.kind === "share_post") {
      const sharer = parsed.sharerNickname || "상대방";
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

export const formatDMTime = (isoString) => {
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

export const useDMList = () => {
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

  return {
    dms,
    loading,
    openDMRoom: (roomId) => navigate(`/dms/${roomId}`),
    onlineUsers,
    unreadByRoomId,
  };
};
