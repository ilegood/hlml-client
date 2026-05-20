/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const updateRoomUnread = (rooms, roomId, reason) => {
  const roomKey = String(roomId);
  let found = false;
  const nextRooms = rooms.map((room) => {
    if (String(room.roomId) !== roomKey) return room;

    found = true;
    const current = Number(room.unreadCount || 0);
    return {
      ...room,
      unreadCount: reason === "read" ? 0 : current + 1,
    };
  });

  if (!found && reason === "message") {
    nextRooms.push({ roomId: roomKey, unreadCount: 1 });
  }

  return nextRooms;
};

const countUnread = (rooms) =>
  rooms.reduce((sum, room) => sum + Number(room.unreadCount || 0), 0);

const updateUnreadNotifications = (items, roomId, reason) => {
  const roomKey = String(roomId);
  let found = false;
  const nextItems = items
    .map((item) => {
      if (String(item.roomKey || item.roomId) !== roomKey) return item;

      found = true;
      const current = Number(item.count || 0);
      return {
        ...item,
        count: reason === "read" ? 0 : current + 1,
      };
    })
    .filter((item) => Number(item.count || 0) > 0);

  if (!found && reason === "message") {
    nextItems.push({
      id: `unread:${roomKey}`,
      type: roomKey.startsWith("dm_") ? "dm" : "group",
      roomId: roomKey.startsWith("dm_") ? roomKey.slice(3) : roomKey,
      roomKey,
      title: "새 메시지",
      count: 1,
    });
  }

  return nextItems;
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

  const showAppointmentReminder = useCallback(
    (item) => {
      const minutes = item.remainingMinutes || 30;
      const key = `appointment-reminder:${userId}:${item.roomId}:${item.date}:${item.time}:${minutes}`;
      if (localStorage.getItem(key)) return false;

      localStorage.setItem(key, "1");
      toast(`${item.title}의 약속이 ${minutes}분 남았습니다.`, {
        description: formatReminderTime(item.date, item.time),
      });
      return true;
    },
    [userId],
  );

  const applyUnreadEvent = useCallback(
    ({ roomId, reason = "message" } = {}) => {
      if (!roomId) return;

      setSummary((current) => {
        const roomKey = String(roomId);
        const isDm = roomKey.startsWith("dm_");
        const normalizedRoomId = isDm ? roomKey.slice(3) : roomKey;
        const currentRooms = current?.rooms || { groups: [], dms: [] };
        const nextGroups = isDm
          ? currentRooms.groups || []
          : updateRoomUnread(
              currentRooms.groups || [],
              normalizedRoomId,
              reason,
            );
        const nextDms = isDm
          ? updateRoomUnread(currentRooms.dms || [], normalizedRoomId, reason)
          : currentRooms.dms || [];
        const groupUnread = countUnread(nextGroups);
        const dmUnread = countUnread(nextDms);

        return {
          ...emptySummary,
          ...current,
          groupUnread,
          dmUnread,
          totalUnread: groupUnread + dmUnread,
          rooms: {
            groups: nextGroups,
            dms: nextDms,
          },
        };
      });
      setNotifications((current) => ({
        ...current,
        unread: updateUnreadNotifications(current.unread || [], roomId, reason),
      }));
    },
    [],
  );

  const refresh = useCallback(
    async ({ quiet = true } = {}) => {
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
          nextNotifications || {
            unread: [],
            reminders: [],
            deletionWarnings: [],
          },
        );

        (nextNotifications?.reminders || []).forEach(showAppointmentReminder);

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
    },
    [showAppointmentReminder, token, userId],
  );

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

    socket.on("chat_unread_changed", (event) => {
      applyUnreadEvent(event);
      refresh();
    });

    socket.on("appointment_reminder", (item) => {
      showAppointmentReminder(item);
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
  }, [applyUnreadEvent, refresh, showAppointmentReminder, token, userId]);

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
