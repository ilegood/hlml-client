import { useState } from "react";
import styled from "styled-components";
import friendsData from "../api/friendsData";

const FriendsListStyled = styled.div`
  .sidebar-wrapper {
    position: fixed;
    right: 0;
    top: 25px; /* Header 높이 */
    height: calc(100vh - 25px);
    display: flex;
    align-items: flex-start;
    z-index: 1000;
  }

  .toggle-btn {
    position: absolute;
    left: -40px;
    top: 20px;
    padding: 10px 15px;
    background-color: var(--color-sidebar);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }

  .friend-sidebar {
    width: 335px;
    height: 100%;
    background-color: var(--color-sidebar);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    transition: transform 0.3s ease;
    transform: translateX(100%); /* 기본적으로 숨김 */
    box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);

    &.active {
      transform: translateX(0); /* 열렸을 때 보임 */
    }
  }

  .search-section {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .search-input {
    width: 100%;
    padding: 10px;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 6px;
    box-sizing: border-box;
    outline: none;

    &:focus {
      border-color: var(--color-active);
      background-color: var(--color-input-focus-bg);
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
    opacity: 0.8;
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
      border: 1px solid var(--color-border);
      border-style: solid none;
      padding: 12px 10px;
      background-color: var(--color-item-bg);
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
      background-color: var(--color-item-hover);
    }

    &.active td {
      border-color: var(--color-active);
      box-shadow: 0 0 5px rgba(253, 147, 25, 0.2);
    }
  }

  .avatar-cell {
    width: 50px;
    text-align: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background-color: #555;
    border-radius: 50%;
    display: inline-block;
  }

  .name-cell {
    font-size: 14px;
    color: var(--color-text);
  }

  .status-cell {
    width: 50px;
    text-align: center;
  }

  .status-square {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: inline-block;

    &.online {
      background-color: #b2e0df;
    }

    &.offline {
      background-color: #fbd2a4;
    }
  }

  .friend-detail-card {
    position: absolute;
    top: 50%;
    left: -260px;
    transform: translateY(-50%);
    width: 250px;
    background-color: var(--color-sidebar);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1010;
    border: 1px solid var(--color-border);
    color: var(--color-text);

    &.hidden {
      display: none;
    }
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
    border: 4px solid var(--color-sidebar);
    position: absolute;
    bottom: -30px;
    left: 20px;
  }

  .detail-body {
    padding: 40px 20px 20px;

    h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
      color: var(--color-text);
    }

    p {
      font-size: 12px;
      color: var(--color-text);
      opacity: 0.7;
      margin-bottom: 20px;
    }
  }

  .detail-icons {
    font-size: 11px;
    color: var(--color-text);
    opacity: 0.6;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .detail-action-btn {
    width: 100%;
    padding: 10px;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      background-color: var(--color-item-hover);
    }
  }

  .memo-display {
    background-color: var(--color-input-bg);
    padding: 10px;
    margin-bottom: 15px;
    font-size: 12px;
    color: var(--color-text);
    border-radius: 0 4px 4px 0;
    word-break: break-all;

    p {
      margin: 0 !important;
      color: var(--color-text) !important;
    }
  }

  .memo-textarea {
    width: 100%;
    height: 60px;
    padding: 10px;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
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

  .memo-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-save,
  .btn-cancel {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
  }

  .btn-save {
    background-color: var(--color-active);
    color: white;

    &:hover {
      opacity: 0.8;
    }
  }

  .btn-cancel {
    background-color: var(--color-border);
    color: var(--color-text);

    &:hover {
      opacity: 0.8;
    }
  }

  @media (max-width: 768px) {
    .friend-sidebar {
      width: 280px;
    }
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
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      setSelectedFriend(friend);
      setIsEditingMemo(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setSelectedFriend(null);
  };

  const handleMemoEdit = () => {
    setTempMemo(memos[selectedFriend.id] || "");
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    setMemos({ ...memos, [selectedFriend.id]: tempMemo });
    setIsEditingMemo(false);
  };

  const handleCancelMemo = () => setIsEditingMemo(false);

  return (
    <FriendsListStyled>
      <div className="sidebar-wrapper">
        <div className={`friend-sidebar ${isOpen ? "active" : ""}`}>
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            {isOpen ? "〉" : "〈"}
          </button>
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
            {[
              { label: "온라인 ▾", friends: onlineFriends, status: "online" },
              { label: "오프라인", friends: offlineFriends, status: "offline" },
            ].map(({ label, friends, status }) => (
              <div className="category-section" key={status}>
                <h3 className="category-title">{label}</h3>
                <table className="friend-table">
                  <tbody>
                    {friends.map((friend) => (
                      <tr
                        key={friend.id}
                        className={`friend-row ${selectedFriend?.id === friend.id ? "active" : ""}`}
                        onClick={() => handleFriendClick(friend)}
                      >
                        <td className="avatar-cell">
                          <div className="avatar" />
                        </td>
                        <td className="name-cell">{friend.name}</td>
                        <td className="status-cell">
                          <div className={`status-square ${status}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div
            className={`friend-detail-card ${!selectedFriend ? "hidden" : ""}`}
          >
            <div className="detail-header">
              <div className="detail-avatar-large" />
            </div>
            <div className="detail-body">
              <h4>{selectedFriend?.name}</h4>
              <p>
                {selectedFriend?.statusMessage || "상태 메시지가 없습니다."}
              </p>
              <div className="detail-icons">
                <span>안녕하세요.</span>
              </div>

              {memos[selectedFriend?.id] && !isEditingMemo && (
                <div className="memo-display">
                  <p>{memos[selectedFriend.id]}</p>
                </div>
              )}

              {!isEditingMemo ? (
                <button className="detail-action-btn" onClick={handleMemoEdit}>
                  {memos[selectedFriend?.id] ? "메모 수정" : "메모 추가"}
                </button>
              ) : (
                <div className="memo-input-container">
                  <textarea
                    className="memo-textarea"
                    value={tempMemo}
                    onChange={(e) => setTempMemo(e.target.value)}
                    placeholder="이 친구에 대한 메모를 남겨보세요..."
                  />
                  <div className="memo-actions">
                    <button className="btn-save" onClick={handleSaveMemo}>
                      저장
                    </button>
                    <button className="btn-cancel" onClick={handleCancelMemo}>
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FriendsListStyled>
  );
};

export default FriendsList;
