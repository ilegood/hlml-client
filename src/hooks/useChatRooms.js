import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deletePostBan, getKickedPosts, getPosts } from "../api/posts";
import { useAuth } from "../context/AuthContext.jsx";
import { useChatNotifications } from "../context/ChatNotificationContext";

const sortByAppointment = (rooms) =>
  [...rooms].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;

    const dateA = new Date(`${a.date} ${a.time || "00:00:00"}`);
    const dateB = new Date(`${b.date} ${b.time || "00:00:00"}`);

    return dateA - dateB;
  });

export const useChatRooms = () => {
  const { userId } = useAuth();
  const { summary } = useChatNotifications() || {};
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadByRoomId = useMemo(
    () =>
      new Map(
        (summary?.rooms?.groups || []).map((room) => [
          String(room.roomId),
          room.unreadCount || 0,
        ]),
      ),
    [summary?.rooms?.groups],
  );

  const fetchChatRooms = useCallback(async () => {
    if (!userId) {
      setChatRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [allPosts, kickedPosts] = await Promise.all([
        getPosts(),
        getKickedPosts(),
      ]);

      const myJoinedRooms = allPosts
        .filter((post) => {
          const isAuthor = String(post.user_id) === String(userId);
          const isParticipant = (post.joinedUserIds || [])
            .map(Number)
            .includes(Number(userId));
          return isAuthor || isParticipant;
        })
        .map((room) => ({ ...room, isKicked: false }));

      const combined = [...myJoinedRooms];
      kickedPosts.forEach((room) => {
        if (!combined.find((item) => item.id === room.id)) {
          combined.push({ ...room, isKicked: true });
        }
      });

      setChatRooms(sortByAppointment(combined));
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
      toast.error("채팅방 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    window.addEventListener("chat:rooms-changed", fetchChatRooms);
    return () => {
      window.removeEventListener("chat:rooms-changed", fetchChatRooms);
    };
  }, [fetchChatRooms]);

  const handleDeleteKickedRoom = async (postId) => {
    if (!window.confirm("이 채팅방을 목록에서 삭제하시겠습니까?")) return;

    try {
      await deletePostBan(postId);
      toast.success("목록에서 삭제되었습니다.");
      fetchChatRooms();
    } catch (err) {
      console.error("Failed to delete kicked room:", err);
      toast.error("삭제에 실패했습니다.");
    }
  };

  return {
    chatRooms,
    handleDeleteKickedRoom,
    loading,
    unreadByRoomId,
    userId,
  };
};
