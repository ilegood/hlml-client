import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getBlockedUsers, unblockUser } from "../api/friends";
import { getImageUrl } from "../api/instance";
import styles from "../components/sidebar_components/BlockedListModal.module.css";

export default function BlockedListModal({ onClose }) {
  const [blockedUsers, setBlockedUsers] = useState([]);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      setBlockedUsers(await getBlockedUsers());
    } catch {
      console.error("차단 목록 조회 실패");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (targetId) => {
    if (!window.confirm("정말 차단을 해제하시겠습니까?")) return;

    try {
      await unblockUser(targetId);
      toast.success("차단이 해제되었습니다.");
      await fetchBlockedUsers();
    } catch {
      toast.error("차단 해제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.modalWrapper} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>차단 목록</h2>
          <button className={styles.closeButton} onClick={onClose} title="닫기">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.list}>
          {blockedUsers.length > 0 ? (
            blockedUsers.map((user) => (
              <div key={user.id} className={styles.item}>
                <div className={styles.userInfo}>
                  <div
                    className={styles.image}
                    style={{
                      backgroundImage: user.profile_img
                        ? `url(${getImageUrl(user.profile_img)})`
                        : "none",
                    }}
                  />
                  <div className={styles.name}>{user.nickname}</div>
                </div>
                <button
                  className={styles.unblockButton}
                  onClick={() => handleUnblock(user.id)}
                >
                  차단 해제
                </button>
              </div>
            ))
          ) : (
            <div className={styles.empty}>차단한 유저가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
