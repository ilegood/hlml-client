import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import friendsData from "../api/friendsData";
import MapModal from "./MapModal";

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
    left: -45px;
    top: 20px;
    padding: 10px 15px;
    background-color: var(--color-sidebar);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 8px 0 0 8px;
    cursor: pointer;
    box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    transition: all 0.2s;

    &:hover {
      background-color: var(--color-item-hover);
    }

    &.locked {
      opacity: 0.7;
    }
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

  /* 지도 버튼 스타일 추가 */
  .map-button-container {
    padding: 20px;
    display: flex;
    justify-content: center;
    border-bottom: 1px solid var(--color-border);
  }

  .map-button {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    border: 2px solid var(--color-active);
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background: #eee;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &::after {
      content: "전체 지도 보기";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(7, 177, 188, 0.85);
      color: white;
      text-align: center;
      padding: 6px 0;
      font-size: 11px;
      font-weight: 700;
      z-index: 10;
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
    mask-image: linear-gradient(to bottom, transparent, black 98%, transparent);

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
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");

  // 로그인 상태가 변할 때(로그아웃 등) 목록을 닫음
  useEffect(() => {
    if (!token) {
      setIsOpen(false);
      setSelectedFriend(null);
    }
  }, [token]);

  const filteredFriends = friendsData.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onlineFriends = filteredFriends.filter((f) => f.status === "online");
  const offlineFriends = filteredFriends.filter((f) => f.status === "offline");

  const handleFriendClick = (friend) => {
    if (!token) return; // 비로그인 시 클릭 차단
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      setSelectedFriend(friend);
      setIsEditingMemo(false);
    }
  };

  const handleToggleSidebar = () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      return;
    }
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

  // 사이드바가 열릴 때 지도 초기화
  useEffect(() => {
    if (isOpen && token && window.kakao && window.kakao.maps) {
      // 약간의 지연을 주어 애니메이션이 끝난 후 지도가 그려지게 함
      const timer = setTimeout(() => {
        const container = document.getElementById("sidebar-map");
        if (container) {
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 중심
            level: 5,
          };
          const map = new window.kakao.maps.Map(container, options);

          // 예시 마커 (강남역 등 주요 지점)
          const markerPosition = new window.kakao.maps.LatLng(
            37.4979,
            127.0276,
          );
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          marker.setMap(map);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, token]);

  return (
    <FriendsListStyled>
      <div className="sidebar-wrapper">
        <div className={`friend-sidebar ${isOpen ? "active" : ""}`}>
          <button
            className={`toggle-btn ${!token ? "locked" : ""}`}
            onClick={handleToggleSidebar}
          >
            {isOpen ? "〉" : "〈"}
          </button>

          {token && (
            <div className="map-button-container">
              <div className="map-button" onClick={() => setIsMapOpen(true)}>
                <div
                  id="sidebar-map"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          )}

          <div className="search-section">
            <input
              className="search-input"
              type="text"
              placeholder={token ? "친구 검색" : "로그인 후 이용 가능"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!token}
            />
          </div>

          <div className="scroll-container">
            {token ? (
              [
                { label: "온라인 ▾", friends: onlineFriends, status: "online" },
                {
                  label: "오프라인",
                  friends: offlineFriends,
                  status: "offline",
                },
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
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 0",
                  opacity: 0.5,
                  fontSize: "13px",
                }}
              >
                로그인 후 친구 목록을 확인하세요.
              </div>
            )}
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
      {isMapOpen && <MapModal onClose={() => setIsMapOpen(false)} />}
    </FriendsListStyled>
  );
};

export default FriendsList;
