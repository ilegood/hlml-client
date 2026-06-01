import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { deletePostBan, getKickedPosts, getMyChatRooms } from "../../api/posts";
import ChatRoomItem from "../../components/chat_components/ChatRoomItem";
import styles from "./ChatRoomsPage.module.css";

const sortByAppointment = (rooms) =>
  [...rooms].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;

    const dateA = new Date(`${a.date} ${a.time || "00:00:00"}`);
    const dateB = new Date(`${b.date} ${b.time || "00:00:00"}`);

    return dateA - dateB;
  });

const ChatRoomsPage = () => {
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
        getMyChatRooms(),
        getKickedPosts(),
      ]);

      const myJoinedRooms = allPosts
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
    const timer = window.setTimeout(() => {
      fetchChatRooms();
    }, 0);

    return () => window.clearTimeout(timer);
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
      toast.success("목록에서 삭제했습니다.");
      fetchChatRooms();
    } catch (err) {
      console.error("Failed to delete kicked room:", err);
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>채팅방 목록</h2>
      </div>

      <div className={styles.chatRoomList}>
        {loading ? (
          <div className={styles.empty}>채팅방을 불러오는 중...</div>
        ) : chatRooms.length > 0 ? (
          chatRooms.map((room) => {
            const roomId = String(room.post_id || room.id);
            return (
              <ChatRoomItem
                key={room.id}
                room={{
                  ...room,
                  unreadCount: unreadByRoomId.get(roomId) || 0,
                }}
                onDelete={
                  room.isKicked ? () => handleDeleteKickedRoom(room.id) : null
                }
              />
            );
          })
        ) : (
          <div className={styles.empty}>
            {userId
              ? "참여 중인 채팅방이 없습니다."
              : "로그인하면 채팅방 목록을 확인할 수 있습니다."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
