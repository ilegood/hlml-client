/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { getChatNotifications, getUnreadSummary } from "../api/chat";
import { BASE_URL } from "../api/instance";
import { useAuth } from "./auth";

const ChatNotificationContext = createContext(null);

const emptySummary = {
  groupUnread: 0,
  dmUnread: 0,
  totalUnread: 0,
  rooms: { groups: [], dms: [] },
};

const formatReminderTime = (date, time) => {
  if (!date || !time) return "";
  return `${String(date).slice(0, 10)} ${String(time).slice(0, 5)}`;
};

export const ChatNotificationProvider = ({ children }) => {
  const { token, userId } = useAuth();
  const [summary, setSummary] = useState(emptySummary);
  const [notifications, setNotifications] = useState({
    unread: [],
    reminders: [],
    deletionWarnings: [],
  });
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const refresh = useCallback(async ({ quiet = true } = {}) => {
    if (!token || !userId) {
      setSummary(emptySummary);
      setNotifications({ unread: [], reminders: [], deletionWarnings: [] });
      return;
    }

    try {
      if (!quiet) setLoading(true);
      const [nextSummary, nextNotifications] = await Promise.all([
        getUnreadSummary(),
        getChatNotifications(),
      ]);
      setSummary(nextSummary || emptySummary);
      setNotifications(
        nextNotifications || { unread: [], reminders: [], deletionWarnings: [] },
      );

      (nextNotifications?.reminders || []).forEach((item) => {
        const key = `appointment-reminder:${userId}:${item.roomId}:${item.date}:${item.time}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
        toast(`${item.title} 약속이 30분 이내에 시작됩니다.`, {
          description: formatReminderTime(item.date, item.time),
        });
      });

      (nextNotifications?.deletionWarnings || []).forEach((item) => {
        const key = `room-delete-warning:${userId}:${item.roomId}:${item.deletesAt}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
        toast.warning(`${item.title || "채팅방"}이 30분 뒤 삭제됩니다.`, {
          description: item.message,
        });
      });
    } catch (error) {
      console.error("Failed to refresh chat notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    refresh({ quiet: false });
  }, [refresh]);

  useEffect(() => {
    if (!token || !userId) return undefined;

    refreshTimerRef.current = window.setInterval(() => {
      refresh();
    }, 30000);

    const handleFocus = () => refresh();
    const handleManualRefresh = () => refresh();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("chat:refresh-unread", handleManualRefresh);

    return () => {
      window.clearInterval(refreshTimerRef.current);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("chat:refresh-unread", handleManualRefresh);
    };
  }, [refresh, token, userId]);

  useEffect(() => {
    if (!token || !userId) return undefined;

    const socket = io(BASE_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("chat_unread_changed", () => {
      refresh();
    });

    socket.on("chat_room_deletion_warning", (warning) => {
      const key = `room-delete-warning:${userId}:${warning.roomId}:${warning.deletesAt}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        toast.warning(`${warning.title || "채팅방"}이 30분 뒤 삭제됩니다.`, {
          description: warning.message,
        });
      }
      refresh();
    });

    socket.on("chat_room_deleted", ({ roomId, title }) => {
      const key = `room-deleted:${userId}:${roomId}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      toast(`${title || "채팅방"}이 삭제되었습니다.`);
      refresh();
      window.dispatchEvent(new Event("chat:rooms-changed"));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refresh, token, userId]);

  const value = useMemo(
    () => ({
      summary,
      notifications,
      loading,
      refresh,
    }),
    [summary, notifications, loading, refresh],
  );

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
    </ChatNotificationContext.Provider>
  );
};

export const useChatNotifications = () => useContext(ChatNotificationContext);
