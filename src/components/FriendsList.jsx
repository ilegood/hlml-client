import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { getFriends, getFriendRequests, acceptFriend, rejectFriend, blockUser } from "../api/friends";
import { useAuth } from "../context/AuthContext";
import AddFriendModal from "./AddFriendModal";
import ReportModal from "./ReportModal";

const FriendsListStyled = styled.div`
  .sidebar-wrapper {
    position: fixed;
    right: 0;
    top: 25px;
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
    transform: translateX(100%);
    box-shadow: -5px 0 10px rgba(0, 0, 0, 0.1);

    &.active {
      transform: translateX(0);
    }
  }

  .search-section {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-input {
    flex: 1;
    padding: 10px;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 6px;
    box-sizing: border-box;
    outline: none;
    &:focus { border-color: var(--color-active); background-color: var(--color-input-focus-bg); }
  }

  .add-plus-btn {
    width: 38px;
    height: 38px;
    background-color: var(--color-active);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &:hover { opacity: 0.9; }
  }

  .scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px 20px;
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb { background-color: var(--color-active); border-radius: 4px; }
  }

  .category-section { margin-bottom: 20px; }
  .category-title { font-size: 14px; color: var(--color-text); margin: 20px 0 10px 0; font-weight: bold; opacity: 0.8; }

  .friend-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
  .friend-row {
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    td { border: 1px solid var(--color-border); border-style: solid none; padding: 12px 10px; background-color: var(--color-item-bg); color: var(--color-text); }
    td:first-child { border-left-style: solid; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
    td:last-child { border-right-style: solid; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
    &:hover td { border-color: var(--color-active); background-color: var(--color-item-hover); }
    &.active td { border-color: var(--color-active); box-shadow: 0 0 5px rgba(253, 147, 25, 0.2); }
  }

  .avatar-cell { width: 45px; text-align: center; }
  .avatar {
    width: 32px;
    height: 32px;
    background-color: #555;
    border-radius: 50%;
    display: inline-block;
    background-size: cover;
    background-position: center;
  }

  .name-cell { font-size: 14px; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  
  .menu-cell { width: 30px; text-align: center; position: relative; }
  .menu-btn {
    background: none; border: none; color: var(--color-text); font-size: 18px; cursor: pointer; opacity: 0.5;
    &:hover { opacity: 1; color: var(--color-active); }
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 35px;
    background: var(--color-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1020;
    overflow: hidden;
    width: 100px;
    button {
      width: 100%; padding: 10px; border: none; background: none; color: var(--color-text); font-size: 12px; cursor: pointer; text-align: left;
      &:hover { background: var(--color-item-hover); color: var(--color-active); }
      &.danger { color: #eb4d4b; &:hover { background: rgba(235, 77, 75, 0.1); } }
    }
  }

  .status-cell { width: 30px; text-align: center; }
  .status-square {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    display: inline-block;
    &.online { background-color: #b2e0df; }
    &.offline { background-color: #fbd2a4; }
  }

  .request-item {
    display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 10px; background-color: var(--color-item-bg);
    .request-name { flex: 1; font-size: 13px; }
    .action-btns {
      display: flex; gap: 5px;
      button { padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; }
      .accept { background-color: var(--color-active); color: white; }
      .reject { background-color: #ff4d4d; color: white; }
    }
  }

  .friend-detail-card {
    position: absolute; top: 50%; left: -260px; transform: translateY(-50%); width: 250px; background-color: var(--color-sidebar); border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); overflow: hidden; z-index: 1010; border: 1px solid var(--color-border); color: var(--color-text);
    &.hidden { display: none; }
  }

  .detail-header { height: 80px; background-color: var(--color-active); position: relative; }
  .detail-avatar-large { width: 60px; height: 60px; background-color: #777; border-radius: 50%; border: 4px solid var(--color-sidebar); position: absolute; bottom: -30px; left: 20px; background-size: cover; background-position: center; }
  .detail-body {
    padding: 40px 20px 20px;
    h4 { margin: 0 0 5px 0; font-size: 16px; color: var(--color-text); }
    p { font-size: 12px; color: var(--color-text); opacity: 0.7; margin-bottom: 20px; }
  }

  .detail-icons { font-size: 11px; color: var(--color-text); opacity: 0.6; line-height: 1.5; margin-bottom: 20px; }
  .detail-action-btn { width: 100%; padding: 10px; background-color: var(--color-input-bg); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 6px; cursor: pointer; font-size: 13px; &:hover { background-color: var(--color-item-hover); } }

  .memo-display { background-color: var(--color-input-bg); padding: 10px; margin-bottom: 15px; font-size: 12px; color: var(--color-text); border-radius: 0 4px 4px 0; word-break: break-all; p { margin: 0 !important; color: var(--color-text) !important; } }
  .memo-textarea { width: 100%; height: 60px; padding: 10px; background-color: var(--color-input-bg); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 6px; resize: none; box-sizing: border-box; font-family: inherit; font-size: 12px; &:focus { outline: none; border-color: var(--color-active); } }
  .memo-actions { display: flex; gap: 8px; margin-top: 8px; }
  .btn-save, .btn-cancel { flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; }
  .btn-save { background-color: var(--color-active); color: white; &:hover { opacity: 0.8; } }
  .btn-cancel { background-color: var(--color-border); color: var(--color-text); &:hover { opacity: 0.8; } }

  @media (max-width: 768px) { .friend-sidebar { width: 280px; } }
`;

const FriendsList = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");

  const menuRef = useRef(null);

  const fetchAll = async () => {
    if (!token) return;
    try {
      const [fData, rData] = await Promise.all([getFriends(), getFriendRequests()]);
      setFriends(fData);
      setRequests(rData);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptFriend(id);
      fetchAll();
    } catch (err) { alert("수락 실패"); }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriend(id);
      fetchAll();
    } catch (err) { alert("거절 실패"); }
  };

  const handleDeleteFriend = async (id) => {
    if (window.confirm("정말 친구를 삭제하시겠습니까?")) {
      try {
        await rejectFriend(id);
        fetchAll();
        setActiveMenuId(null);
        if (selectedFriend?.id === id) setSelectedFriend(null);
      } catch (err) { alert("삭제 실패"); }
    }
  };

  const handleBlockUser = async (id) => {
    if (window.confirm("정말 이 사용자를 차단하시겠습니까?")) {
      try {
        await blockUser(id);
        fetchAll();
        setActiveMenuId(null);
        if (selectedFriend?.id === id) setSelectedFriend(null);
        alert("차단되었습니다.");
      } catch (err) { alert("차단 실패"); }
    }
  };

  const handleReport = () => {
    setIsReportModalOpen(true);
    setActiveMenuId(null);
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            <button className="add-plus-btn" onClick={() => setIsAddModalOpen(true)}>+</button>
          </div>

          <div className="scroll-container">
            {requests.length > 0 && (
              <div className="category-section">
                <h3 className="category-title">친구 요청 {requests.length}</h3>
                {requests.map(req => (
                  <div key={req.id} className="request-item">
                    <div className="avatar" style={{ backgroundImage: req.profile_img ? `url(http://localhost:4000${req.profile_img})` : 'none' }} />
                    <span className="request-name">{req.name}</span>
                    <div className="action-btns">
                      <button className="accept" onClick={() => handleAccept(req.id)}>수락</button>
                      <button className="reject" onClick={() => handleReject(req.id)}>거절</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="category-section">
              <h3 className="category-title">친구 {filteredFriends.length}</h3>
              <table className="friend-table">
                <tbody>
                  {filteredFriends.map((friend) => (
                    <tr
                      key={friend.id}
                      className={`friend-row ${selectedFriend?.id === friend.id ? "active" : ""}`}
                      onClick={() => handleFriendClick(friend)}
                    >
                      <td className="avatar-cell">
                        <div className="avatar" style={{ backgroundImage: friend.profile_img ? `url(http://localhost:4000${friend.profile_img})` : 'none' }} />
                      </td>
                      <td className="name-cell">{friend.name}</td>
                      <td className="menu-cell" onClick={(e) => e.stopPropagation()}>
                        <button className="menu-btn" onClick={() => setActiveMenuId(activeMenuId === friend.id ? null : friend.id)}>
                          ⋮
                        </button>
                        {activeMenuId === friend.id && (
                          <div className="dropdown-menu" ref={menuRef}>
                            <button onClick={() => handleDeleteFriend(friend.id)}>친구 삭제</button>
                            <button onClick={() => handleBlockUser(friend.id)}>차단하기</button>
                            <button className="danger" onClick={handleReport}>신고하기</button>
                          </div>
                        )}
                      </td>
                      <td className="status-cell">
                        <div className={`status-square ${friend.status}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`friend-detail-card ${!selectedFriend ? "hidden" : ""}`}
          >
            <div className="detail-header">
              <div className="detail-avatar-large" style={{ backgroundImage: selectedFriend?.profile_img ? `url(http://localhost:4000${selectedFriend.profile_img})` : 'none' }} />
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
      {isAddModalOpen && <AddFriendModal onClose={() => setIsAddModalOpen(false)} />}
      {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} />}
    </FriendsListStyled>
  );
};

export default FriendsList;
