<<<<<<< Updated upstream
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { deletePostBan, getKickedPosts, getPosts } from "../../api/posts";
import ChatRoomItem from "../../components/chat_components/ChatRoomItem";

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
      toast.success("목록에서 삭제했습니다.");
      fetchChatRooms();
    } catch (err) {
      console.error("Failed to delete kicked room:", err);
      toast.error("삭제에 실패했습니다.");
    }
  };
=======
import ChatRoomItem from "../../components/chat_components/ChatRoomItem";
import { useChatRooms } from "../../hooks/useChatRooms";
const ChatRoomsPage = () => {
  const {
    chatRooms,
    handleDeleteKickedRoom,
    loading,
    unreadByRoomId,
    userId,
  } = useChatRooms();
>>>>>>> Stashed changes

  return (
    <div className="mx-auto flex min-h-[calc(100vh-25px)] max-w-[900px] flex-col bg-[var(--color-bg)] p-5">
      <div className="mb-[25px] border-b border-[var(--color-border)] pb-[15px]">
        <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-active)]">채팅방 목록</h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-[5px] pb-[30px] pt-[5px]">
        {loading ? (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">채팅방을 불러오는 중...</div>
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
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
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
