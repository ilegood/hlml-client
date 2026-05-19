import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { getBlockedUsers, unblockUser } from "../../api/friends";
import { getImageUrl } from "../../api/instance";

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);

  .modal-content {
    width: 400px;
    padding: 30px;
    border-radius: 24px;
    background: var(--color-sidebar);
    color: var(--color-text);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .header h2 {
    color: #ff4757;
    font-size: 20px;
    font-weight: 800;
  }

  .close-btn {
    border: none;
    background: none;
    color: var(--color-deactive);
    cursor: pointer;
  }

  .list {
    display: flex;
    max-height: 400px;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-input-bg);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ddd center / cover;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
  }

  .unblock-btn {
    padding: 6px 12px;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    background: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .unblock-btn:hover {
    border-color: #ff4757;
    color: #ff4757;
  }

  .empty {
    padding: 40px 0;
    color: var(--color-deactive);
    font-size: 14px;
    text-align: center;
  }
`;

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
      toast.success("차단을 해제했습니다.");
      await fetchBlockedUsers();
    } catch {
      toast.error("차단 해제에 실패했습니다.");
    }
  };

  return (
    <ModalWrapper onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="header">
          <h2>차단 목록</h2>
          <button className="close-btn" onClick={onClose} title="닫기">
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

        <div className="list">
          {blockedUsers.length > 0 ? (
            blockedUsers.map((user) => (
              <div key={user.id} className="item">
                <div className="user-info">
                  <div
                    className="img"
                    style={{
                      backgroundImage: user.profile_img
                        ? `url(${getImageUrl(user.profile_img)})`
                        : "none",
                    }}
                  />
                  <div className="name">{user.nickname}</div>
                </div>
                <button
                  className="unblock-btn"
                  onClick={() => handleUnblock(user.id)}
                >
                  차단 해제
                </button>
              </div>
            ))
          ) : (
            <div className="empty">차단한 유저가 없습니다.</div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
