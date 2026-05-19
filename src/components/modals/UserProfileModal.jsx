import { useEffect, useState } from "react";
import styles from "./UserProfileModal.module.css";
import { getUserPublicProfile } from "../../api/users";
import { addFriend } from "../../api/friends";
import { getImageUrl } from "../../api/instance";
import { toast } from "sonner";

export default function UserProfileModal({ userId, onClose, currentUserId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserPublicProfile(userId);
        setUser(data);
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

  const handleAddFriend = async () => {
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
        ) : user ? (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                {user.profile_img ? (
                  <img src={getImageUrl(user.profile_img)} alt={user.nickname} />
                ) : (
                  <span className={styles.defaultAvatar}>
                    {user.nickname.slice(0, 1)}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.profileContent}>
              <h3 className={styles.nickname}>{user.nickname}</h3>
              <p className={styles.bio}>{user.bio || "소개가 없습니다."}</p>
              
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
          </>
        ) : null}
      </div>
    </div>
  );
}
