import { useState } from "react";
import styled from "styled-components";
import friendsData from "../api/friendsData";

const SidebarWrapper = styled.div`
  position: fixed;
  right: 0;
  height: calc(100vh - 25px);
  display: flex;
  align-items: flex-start;
  z-index: 1000;
  box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);

  .toggle-btn {
    position: absolute;
    left: -40px;
    top: 20px;
    padding: 10px 15px;
    background-color: var(--color-bg);
    color: var(--color-text);
    border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }

  .friend-sidebar {
    width: 335px;
    height: 100%;
    background-color: var(--color-bg);
    border-left: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
    display: ${(props) => (props.$isOpen ? "flex" : "none")};
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    transition: transform 0.3s ease;
  }

  .search-section {
    padding: 20px;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }

  .search-input {
    width: 100%;
    padding: 10px;
    background-color: var(--color-bg);
    color: var(--color-text);
    border: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
    border-radius: 6px;
    box-sizing: border-box;
    outline: none;
    &:focus {
      border-color: var(--color-active);
    }
  }

  .scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px 20px;
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 2%,
      black 98%,
      transparent
    );

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-active);
      border-radius: 4px;
    }
  }

  .category-section {
    margin-bottom: 20px;
  }

  .category-title {
    font-size: 14px;
    color: var(--color-text);
    margin: 20px 0 10px 0;
    font-weight: bold;
  }

  .friend-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;
  }

  .friend-row {
    cursor: pointer;
    transition: all 0.2s ease;

    td {
      border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
      border-style: solid none;
      padding: 12px 10px;
      background-color: var(--color-bg);
      color: var(--color-text);
    }

    td:first-child {
      border-left-style: solid;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }

    td:last-child {
      border-right-style: solid;
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    &:hover td {
      border-color: var(--color-active);
    }

    &.active td {
      border-color: var(--color-active);
      box-shadow: 0 0 5px color-mix(in srgb, var(--color-active) 20%, transparent);
    }
  }

  .avatar {
    width: 32px;
    height: 32px;
    background-color: var(--color-deactive);
    border-radius: 50%;
    display: inline-block;
  }

  .status-square {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: inline-block;
  }

  .status-online {
    background-color: var(--color-deactive);
  }

  .status-offline {
    background-color: #fbd2a4;
    opacity: 0.6;
  }

  .detail-card {
    position: absolute;
    top: 50%;
    left: -260px;
    transform: translateY(-50%);
    width: 250px;
    background-color: var(--color-bg);
    color: var(--color-text);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1010;
    border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
    display: ${(props) => (props.$hasSelected ? "block" : "none")};
  }

  .detail-header {
    height: 80px;
    background-color: var(--color-active);
    position: relative;
  }

  .detail-avatar-large {
    width: 60px;
    height: 60px;
    background-color: #777;
    border-radius: 50%;
    border: 4px solid var(--color-bg);
    position: absolute;
    bottom: -30px;
    left: 20px;
  }

  .detail-body {
    padding: 40px 20px 20px;

    h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }
    p {
      font-size: 12px;
      color: var(--color-deactive);
      margin-bottom: 20px;
    }
  }

  .memo-display {
    background-color: color-mix(in srgb, var(--color-text) 5%, transparent);
    padding: 10px;
    margin-bottom: 15px;
    font-size: 12px;
    color: var(--color-text);
    border-radius: 0 4px 4px 0;
    word-break: break-all;
  }

  .memo-textarea {
    width: 100%;
    height: 60px;
    padding: 10px;
    background-color: var(--color-bg);
    color: var(--color-text);
    border: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
    border-radius: 6px;
    resize: none;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 12px;
    &:focus {
      outline: none;
      border-color: var(--color-active);
    }
  }

  .btn-action {
    width: 100%;
    padding: 10px;
    background-color: var(--color-bg);
    color: var(--color-text);
    border: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    &:hover {
      background-color: color-mix(in srgb, var(--color-text) 5%, transparent);
    }
  }

  .save-btn {
    background-color: var(--color-active);
    color: white;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    flex: 1;
  }

  .cancel-btn {
    background-color: color-mix(in srgb, var(--color-text) 10%, transparent);
    color: var(--color-text);
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    flex: 1;
  }
`;

const FriendsList = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineFriends = filteredFriends.filter((f) => f.status === "online");
  const offlineFriends = filteredFriends.filter((f) => f.status === "offline");

  const handleFriendClick = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      setSelectedFriend(friend);
      setIsEditingMemo(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedFriend(null);
    }
  };

  const handleMemoEdit = () => {
    setTempMemo(memos[selectedFriend.id] || "");
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    setMemos({
      ...memos,
      [selectedFriend.id]: tempMemo,
    });
    setIsEditingMemo(false);
  };

  const handleCancelMemo = () => {
    setIsEditingMemo(false);
  };

  return (
    <SidebarWrapper $isOpen={isOpen} $hasSelected={!!selectedFriend}>
      <button className="toggle-btn" onClick={handleToggleSidebar}>
        {isOpen ? "〉" : "〈"}
      </button>

      <div className="friend-sidebar">
        <div className="search-section">
          <input
            className="search-input"
            type="text"
            placeholder="친구 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="scroll-container">
          <div className="category-section">
            <h3 className="category-title">온라인 ▾</h3>
            <table className="friend-table">
              <tbody>
                {onlineFriends.map((friend) => (
                  <tr
                    key={friend.id}
                    className={`friend-row ${selectedFriend?.id === friend.id ? "active" : ""}`}
                    onClick={() => handleFriendClick(friend)}
                  >
                    <td style={{ width: "50px", textAlign: "center" }}>
                      <div className="avatar" />
                    </td>
                    <td style={{ fontSize: "14px" }}>{friend.name}</td>
                    <td style={{ width: "50px", textAlign: "center" }}>
                      <div className="status-square status-online" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="category-section">
            <h3 className="category-title">오프라인</h3>
            <table className="friend-table">
              <tbody>
                {offlineFriends.map((friend) => (
                  <tr
                    key={friend.id}
                    className={`friend-row ${selectedFriend?.id === friend.id ? "active" : ""}`}
                    onClick={() => handleFriendClick(friend)}
                  >
                    <td style={{ width: "50px", textAlign: "center" }}>
                      <div className="avatar" />
                    </td>
                    <td style={{ fontSize: "14px" }}>{friend.name}</td>
                    <td style={{ width: "50px", textAlign: "center" }}>
                      <div className="status-square status-offline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-avatar-large" />
          </div>
          <div className="detail-body">
            <h4>{selectedFriend?.name}</h4>
            <p>{selectedFriend?.statusMessage || "상태 메시지가 없습니다."}</p>

            {memos[selectedFriend?.id] && !isEditingMemo && (
              <div className="memo-display">
                <p style={{ margin: 0 }}>{memos[selectedFriend.id]}</p>
              </div>
            )}

            {!isEditingMemo ? (
              <button className="btn-action" onClick={handleMemoEdit}>
                {memos[selectedFriend?.id] ? "메모 수정" : "메모 추가"}
              </button>
            ) : (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  className="memo-textarea"
                  value={tempMemo}
                  onChange={(e) => setTempMemo(e.target.value)}
                  placeholder="이 친구에 대한 메모를 남겨보세요..."
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button className="save-btn" onClick={handleSaveMemo}>
                    저장
                  </button>
                  <button className="cancel-btn" onClick={handleCancelMemo}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default FriendsList;
