import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { getPosts, getKickedPosts, deletePostBan } from "../api/posts";
import ChatRoomItem from "../Components/ChatRoomItem";
import styles from "./ChatRoomsPage.module.css";
import { toast } from "sonner";

const ChatRoomsPage = () => {
  const { userId, name } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = async () => {
    try {
      const [allPosts, kickedPosts] = await Promise.all([
        getPosts(),
        getKickedPosts(),
      ]);

      // 내가 작성했거나 참여한 게시글 필터링
      const myJoinedRooms = allPosts
        .filter((post) => {
          const isAuthor = post.author === name;
          const isParticipant = (post.joinedUserIds || [])
            .map((id) => Number(id))
            .includes(Number(userId));
          return isAuthor || isParticipant;
        })
        .map((room) => ({ ...room, isKicked: false }));

      // 강퇴된 방들 마킹
      const myKickedRooms = kickedPosts.map((room) => ({
        ...room,
        isKicked: true,
      }));

      // 합치기 (중복 제거 - 드문 경우지만 혹시 모르니)
      const combined = [...myJoinedRooms];
      myKickedRooms.forEach((kr) => {
        if (!combined.find((c) => c.id === kr.id)) {
          combined.push(kr);
        }
      });

      // 약속 날짜가 빠른 순서대로 정렬
      combined.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        const dateA = new Date(`${a.date} ${a.time || "00:00:00"}`);
        const dateB = new Date(`${b.date} ${b.time || "00:00:00"}`);

        return dateA - dateB;
      });

      setChatRooms(combined);
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const allPosts = await getPosts();
        // 내가 작성했거나 참여한 게시글 필터링
        const myRooms = allPosts.filter((post) => {
          const isAuthor = String(post.user_id) === String(userId);
          // Number() 처리로 타입 불일치 방지
          const isParticipant = (post.joinedUserIds || [])
            .map((id) => Number(id))
            .includes(Number(userId));
          return isAuthor || isParticipant;
        });

        // 약속 날짜가 빠른 순서대로 정렬
        myRooms.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;

          const dateA = new Date(`${a.date} ${a.time || "00:00:00"}`);
          const dateB = new Date(`${b.date} ${b.time || "00:00:00"}`);

          return dateA - dateB;
        });

        setChatRooms(myRooms);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId || name) {
      fetchChatRooms();
    } else {
      setLoading(false);
    }
  }, [userId, name]);

  const handleDeleteKickedRoom = async (postId) => {
    if (!window.confirm("이 채팅방을 목록에서 삭제하시겠습니까?")) return;

    try {
      await deletePostBan(postId);
      toast.success("목록에서 삭제되었습니다.");
      fetchChatRooms(); // 목록 새로고침
    } catch (err) {
      console.error("Failed to delete kicked room:", err);
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>내 채팅방 목록</h2>
      </div>

      <div className={styles.chatRoomList}>
        {loading ? (
          <div className={styles.empty}>채팅방을 불러오는 중...</div>
        ) : chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              onDelete={
                room.isKicked ? () => handleDeleteKickedRoom(room.id) : null
              }
            />
          ))
        ) : (
          <div className={styles.empty}>
            {userId
              ? "참여 중인 채팅방이 없습니다."
              : "로그인 후 채팅방 목록을 확인하세요."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
