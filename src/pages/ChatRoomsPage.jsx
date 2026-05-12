import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { getPosts } from "../api/posts";
import ChatRoomItem from "../Components/ChatRoomItem";
import styles from "./ChatRoomsPage.module.css";

const ChatRoomsPage = () => {
  const { userId, name } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const allPosts = await getPosts();
        // 내가 작성했거나 참여한 게시글 필터링
        const myRooms = allPosts.filter((post) => {
          const isAuthor = post.author === name;
          // Number() 처리로 타입 불일치 방지
          const isParticipant = (post.joinedUserIds || []).map(id => Number(id)).includes(Number(userId));
          return isAuthor || isParticipant;
        });

        // 약속 날짜가 빠른 순서대로 정렬
        myRooms.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
          const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
          
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
              currentUserName={name}
            />
          ))
        ) : (
          <div className={styles.empty}>
            {userId ? "참여 중인 채팅방이 없습니다." : "로그인 후 채팅방 목록을 확인하세요."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
