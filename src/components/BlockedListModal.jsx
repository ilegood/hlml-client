import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { getBlockedUsers, unblockUser } from "../api/friends";
import { getImageUrl } from "../api/instance";

// ... (ModalWrapper styled component content remains the same)
const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 400px;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: #ff4757;
    }
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-deactive);
    }
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--color-input-bg);
      border-radius: 12px;
      border: 1px solid var(--color-border);

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        .img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ddd;
          background-size: cover;
          background-position: center;
        }
        .name {
          font-size: 14px;
          font-weight: 600;
        }
      }

      .unblock-btn {
        padding: 6px 12px;
        border-radius: 8px;
        border: 1.5px solid var(--color-border);
        background: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        &:hover {
          border-color: #ff4757;
          color: #ff4757;
        }
      }
    }
  }

  .empty {
    text-align: center;
    padding: 40px 0;
    color: var(--color-deactive);
    font-size: 14px;
  }
`;

export default function BlockedListModal({ onClose }) {
  const [blockedUsers, setBlockedUsers] = useState([]);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const data = await getBlockedUsers();
      setBlockedUsers(data);
    } catch (_err) {
      console.error("차단 목록 조회 실패");
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (targetId) => {
    if (!window.confirm("정말 차단을 해제하시겠습니까?")) return;
    try {
      await unblockUser(targetId);
      alert("차단이 해제되었습니다.");
      fetchBlockedUsers();
    } catch (_err) {
      alert("차단 해제에 실패했습니다.");
    }
  };

  return (
    <ModalWrapper onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <h2>차단 목록</h2>
          <button className="close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
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
                  ></div>
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
