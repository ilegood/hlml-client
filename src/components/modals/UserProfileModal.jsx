import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserProfileModal.module.css";
import { getUserActivity } from "../../api/users";
import { addFriend } from "../../api/friends";
import { getImageUrl } from "../../api/instance";
import ProfileAvatar from "../ProfileAvatar";
import { toast } from "sonner";

const TAB_LABELS = {
  posts: "게시글",
  appointments: "약속",
  reports: "신고기록",
};

const formatDateTime = (date, time) => {
  if (!date) return "";
  const datePart = String(date).slice(0, 10);
  const timePart = time ? String(time).slice(0, 5) : "";
  return timePart ? `${datePart} ${timePart}` : datePart;
};

export default function UserProfileModal({ userId, onClose, currentUserId }) {
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserActivity(userId);
        setActivity(data);
        setActiveTab("posts");
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        toast.error("프로필을 불러오지 못했습니다.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId, onClose]);

  const user = activity?.profile || null;
  const stats = activity?.stats || { posts: 0, appointments: 0, reports: 0 };

  const handleAddFriend = async () => {
    if (!user) return;

    try {
      const res = await addFriend(user.nickname);
      toast.success(res.message || `${user.nickname}님께 친구 요청을 보냈습니다.`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "친구 요청에 실패했습니다.");
    }
  };

  if (!userId) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : activity && user ? (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <ProfileAvatar
                  profileImg={user.profile_img}
                  nickname={user.nickname}
                  size={80}
                  className="!h-full !w-full"
                />
              </div>
            </div>

            <div className={styles.profileContent}>
              <h3 className={styles.nickname}>{user.nickname}</h3>
              <p className={styles.bio}>{user.bio || "소개가 없습니다."}</p>

              <div className={styles.metaLine}>
                <button
                  type="button"
                  className={`${styles.metaLink} ${
                    activeTab === "posts" ? styles.metaLinkActive : ""
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  게시글 {stats.posts || 0}
                </button>
                <span
                  className={`${styles.metaLink}`}
                >
                  약속 {stats.appointments || 0}
                </span>
                <span
                  className={`${styles.metaLink}`}
                >
                  신고기록 {stats.reports || 0}
                </span>
              </div>

              <div className={styles.actions}>
                {Number(user.user_id) !== Number(currentUserId) && (
                  <button className={styles.addFriendBtn} onClick={handleAddFriend}>
                    친구 추가
                  </button>
                )}
                <button className={styles.closeBtn} onClick={onClose}>
                  닫기
                </button>
              </div>
            </div>

            <div className={styles.listPane}>
              {activeTab === "posts" &&
                (activity.posts?.length > 0 ? (
                  activity.posts.map((post) => (
                    <button
                      key={post.post_id}
                      type="button"
                      className={styles.listItem}
                      onClick={() => navigate(`/detail/${post.post_id}`)}
                    >
                      <div className={styles.listItemImageContainer}>
                        {post.image && (
                          <img
                            src={getImageUrl(post.image)}
                            alt="Post Thumbnail"
                            className={styles.listItemImage}
                          />
                        )}
                      </div>
                      <div className={styles.listBody}>
                        <strong>{post.title}</strong>
                        <span>{formatDateTime(post.date, post.time)}</span>
                        <p>{post.place || "장소 정보 없음"}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <strong>게시글</strong>
                    <span>표시할 게시글이 없습니다.</span>
                  </div>
                ))}

              {activeTab === "appointments" &&
                (activity.appointments?.length > 0 ? (
                  activity.appointments.map((item) => (
                    <div key={item.id} className={styles.simpleRow}>
                      <strong>{item.title}</strong>
                      <span>{formatDateTime(item.date, item.time)}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <strong>약속</strong>
                    <span>표시할 약속이 없습니다.</span>
                  </div>
                ))}

              {activeTab === "reports" &&
                (activity.reports?.length > 0 ? (
                  activity.reports.map((report) => (
                    <div key={report.id} className={styles.simpleRow}>
                      <strong>{report.target_title || "신고 기록"}</strong>
                      <span>{report.reason}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <strong>신고기록</strong>
                    <span>표시할 신고기록이 없습니다.</span>
                  </div>
                ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
