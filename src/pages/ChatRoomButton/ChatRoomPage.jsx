import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import { getPost, togglePostJoin } from "../../api/posts";
import styles from "./ChatRoomPage.module.css";

export default function ChatRoomPage() {
  // URL 파라미터가 :id 인지 :roomId 인지 확인이 필요합니다. (기존 DetailPage 기준 id 사용)
  const { id, roomId } = useParams();
  const targetId = id || roomId;
  const navigate = useNavigate();
  const { name, token, userId } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPost(targetId);
        setPost(data);
      } catch (err) {
        console.error("채팅방 정보를 불러오는데 실패했습니다:", err);
        toast.error("채팅방 정보를 불러올 수 없습니다.");
        navigate("/chat-rooms");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadPost();
  }, [targetId, token, navigate]);

  // 채팅방 완전히 나가기 기능
  const handleExitRoom = () => {
    toast.error("정말 채팅방을 나가시겠습니까?", {
      description:
        "방을 나가면 참여 명단에서 삭제되며 더 이상 대화를 볼 수 없습니다.",
      action: {
        label: "나가기",
        onClick: async () => {
          try {
            // 1. 서버 DB에서 참여 정보 삭제 (참여 취소)
            await togglePostJoin(targetId);

            toast.success("채팅방에서 퇴장하였습니다.");
            // 2. 채팅 목록으로 이동 (뒤로가기 방지를 위해 replace 사용)
            navigate("/chat-rooms", { replace: true });
          } catch (err) {
            console.error("퇴장 오류:", err);
            toast.error("퇴장 처리에 실패했습니다. 다시 시도해 주세요.");
          }
        },
      },
    });
  };

  // 메시지 전송 (UI 전용 예시)
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = e.target.elements.message.value;
    if (!text.trim()) return;

    // TODO: Socket.io 연동 시 socket.emit("send_message", ...) 추가
    toast.info("메시지 전송 기능이 준비 중입니다.");
    e.target.reset();
  };

  // 상단 버튼 기능들
  const handleViewMembers = () =>
    toast.info(`참여자 목록: ${post.participants || 0}명`);
  const handleViewMap = () => toast.info("지도 보기 기능 준비 중입니다.");
  const handleSettings = () => toast.info("알람 설정 기능 준비 중입니다.");

  if (loading)
    return <div className={styles.loading}>채팅방을 불러오는 중...</div>;
  if (!post)
    return <div className={styles.loading}>정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.titleInfo}>
          <h1 className={styles.title}>{post.title}</h1>
          <span className={styles.count}>
            <span className={styles.statusDot}></span>
            {post.participants || 0} / {post.capacity || 0}명 참여 중
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handleViewMembers}
            title="멤버보기"
          >
            👥
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleViewMap}
            title="지도보기"
          >
            📍
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleSettings}
            title="알람설정"
          >
            🔔
          </button>
          <button
            className={`${styles.actionBtn} ${styles.exitBtn}`}
            onClick={handleExitRoom}
            title="나가기"
          >
            🚪
          </button>
        </div>
      </header>

      <main className={styles.chatArea}>
        <div className={styles.systemNotice}>
          <span>
            안전하고 즐거운 모임을 위해 비방이나 욕설은 자제해 주세요.
          </span>
        </div>
        {/* 실시간 채팅 메시지 영역 (Socket.io 연동 예정) */}
        <div className={styles.emptyChat}>대화를 시작해보세요!</div>
      </main>

      <form className={styles.footer} onSubmit={handleSendMessage}>
        <input
          name="message"
          type="text"
          placeholder="메시지를 입력하세요..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendBtn}>
          전송
        </button>
      </form>
    </div>
  );
}
