import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getImageUrl } from "../../api/instance";
import instance from "../../api/instance";
import styles from "./ChatRoomsPage.module.css";
import itemStyles from "../../components/chat_components/ChatRoomItem.module.css";

const DMsPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [dms, setDms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDMs = async () => {
      try {
        const res = await instance.get("/chat/dm");
        setDms(res.data);
      } catch (err) {
        console.error("DM 목록 조회 실패", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDMs();
    }
  }, [userId]);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>개인 메시지</h2>
      </div>

      <div className={styles.chatRoomList}>
        {loading ? (
          <div className={styles.empty}>메시지를 불러오는 중...</div>
        ) : dms.length > 0 ? (
          dms.map((dm) => (
            <div
              key={dm.roomId}
              className={itemStyles.chatRoomItem}
              onClick={() => navigate(`/dms/${dm.roomId}`)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={itemStyles.roomAvatar}
                style={{
                  backgroundImage: dm.targetProfileImg
                    ? `url(${getImageUrl(dm.targetProfileImg)})`
                    : "none",
                }}
              >
                {!dm.targetProfileImg && (
                  <div className={itemStyles.noImage}></div>
                )}
              </div>

              <div className={itemStyles.roomInfo}>
                <div className={itemStyles.roomName}>{dm.targetNickname}</div>
                <div className={itemStyles.lastMessage}>
                  {dm.lastMessage || "대화 내용이 없습니다."}
                </div>
              </div>

              <div className={itemStyles.appointmentInfo}>
                <div className={itemStyles.dateTime}>
                  {dm.lastMessageTime && formatTime(dm.lastMessageTime)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            진행 중인 대화가 없습니다.
            <br />
            친구 목록에서 메시지를 보내보세요!
          </div>
        )}
      </div>
    </div>
  );
};

export default DMsPage;
