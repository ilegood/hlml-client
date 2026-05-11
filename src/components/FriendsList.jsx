import { useState, useEffect, useRef } from "react";
import styles from "./FriendsList.module.css";
import {
  getFriends,
  getFriendRequests,
  acceptFriend,
  rejectFriend,
  blockUser,
  updateFriendMemo,
} from "../api/friends";
import { useAuth } from "../context/auth";
import { getImageUrl } from "../api/instance";
import AddFriendModal from "./AddFriendModal";
import ReportModal from "./ReportModal";

const FriendsList = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
  const [cardTop, setCardTop] = useState(0);

  const menuRef = useRef(null);

  const fetchAll = async () => {
    if (!token) return;

    // 개별적으로 요청하여 하나가 실패해도 다른 데이터는 표시되도록 함
    try {
      const fData = await getFriends();
      setFriends(fData);

      // DB에서 가져온 메모로 상태 초기화
      const initialMemos = {};
      fData.forEach((friend) => {
        if (friend.memo) initialMemos[friend.id] = friend.memo;
      });
      setMemos(initialMemos);
    } catch (err) {
      console.error("친구 목록 로드 실패", err);
    }

    try {
      const rData = await getFriendRequests();
      setRequests(rData);
    } catch (err) {
      console.error("친구 요청 로드 실패", err);
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
    } catch (err) {
      alert("수락 실패");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFriend(id);
      fetchAll();
    } catch (err) {
      alert("거절 실패");
    }
  };

  const handleDeleteFriend = async (id) => {
    if (window.confirm("정말 친구를 삭제하시겠습니까?")) {
      try {
        await rejectFriend(id);
        fetchAll();
        setActiveMenuId(null);
        if (selectedFriend?.id === id) setSelectedFriend(null);
      } catch (err) {
        alert("삭제 실패");
      }
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
      } catch (err) {
        alert("차단 실패");
      }
    }
  };

  const handleReport = () => {
    setIsReportModalOpen(true);
    setActiveMenuId(null);
  };

  const filteredFriends = friends.filter((friend) =>
    (friend.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFriendClick = (e, friend) => {
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null);
      setIsEditingMemo(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const sidebarRect = e.currentTarget
        .closest(`.${styles.friendSidebar}`)
        .getBoundingClientRect();

      let top = rect.top - sidebarRect.top;
      const cardHeight = 350; // 예상 높이

      // 화면 하단 영역을 벗어나지 않도록 보정
      if (top + cardHeight > sidebarRect.height) {
        top = sidebarRect.height - cardHeight - 20;
      }
      // 너무 위로 붙지 않도록 보정
      if (top < 20) top = 20;

      setCardTop(top);
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

  const handleSaveMemo = async () => {
    try {
      await updateFriendMemo(selectedFriend.id, tempMemo);
      setMemos({ ...memos, [selectedFriend.id]: tempMemo });
      setIsEditingMemo(false);
    } catch (err) {
      alert("메모 저장 실패");
    }
  };

  const handleCancelMemo = () => setIsEditingMemo(false);

  return (
    <div className={styles.sidebarWrapper}>
      <div className={`${styles.friendSidebar} ${isOpen ? styles.active : ""}`}>
        <button className={styles.toggleBtn} onClick={handleToggleSidebar}>
          {isOpen ? "〉" : "〈"}
        </button>

        <div className={styles.searchSection}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="친구 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className={styles.addPlusBtn}
            onClick={() => setIsAddModalOpen(true)}
          >
            +
          </button>
        </div>

        <div className={styles.scrollContainer}>
          {requests.length > 0 && (
            <div className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>
                친구 요청 {requests.length}
              </h3>
              {requests.map((req) => (
                <div key={req.id} className={styles.requestItem}>
                  <div
                    className={styles.avatar}
                    style={{
                      backgroundImage: req.profile_img
                        ? `url(${getImageUrl(req.profile_img)})`
                        : "none",
                    }}
                  />
                  <span className={styles.requestName}>{req.name}</span>
                  <div className={styles.actionBtns}>
                    <button
                      className={styles.accept}
                      onClick={() => handleAccept(req.id)}
                    >
                      수락
                    </button>
                    <button
                      className={styles.reject}
                      onClick={() => handleReject(req.id)}
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.categorySection}>
            <h3 className={styles.categoryTitle}>
              친구 {filteredFriends.length}
            </h3>
            <table className={styles.friendTable}>
              <tbody>
                {filteredFriends.map((friend) => (
                  <tr
                    key={friend.id}
                    className={`${styles.friendRow} ${selectedFriend?.id === friend.id ? styles.active : ""}`}
                    onClick={(e) => handleFriendClick(e, friend)}
                  >
                    <td className={styles.avatarCell}>
                      <div
                        className={styles.avatar}
                        style={{
                          backgroundImage: friend.profile_img
                            ? `url(${getImageUrl(friend.profile_img)})`
                            : "none",
                        }}
                      />
                    </td>
                    <td className={styles.nameCell}>{friend.name}</td>
                    <td
                      className={styles.menuCell}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className={styles.menuBtn}
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === friend.id ? null : friend.id,
                          )
                        }
                      >
                        ⋮
                      </button>
                      {activeMenuId === friend.id && (
                        <div className={styles.dropdownMenu} ref={menuRef}>
                          <button onClick={() => handleDeleteFriend(friend.id)}>
                            친구 삭제
                          </button>
                          <button onClick={() => handleBlockUser(friend.id)}>
                            차단하기
                          </button>
                          <button
                            className={styles.danger}
                            onClick={handleReport}
                          >
                            신고하기
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`${styles.friendDetailCard} ${!selectedFriend ? styles.hidden : ""}`}
          style={{ top: `${cardTop}px` }}
        >
          <div className={styles.detailHeader}>
            <div
              className={styles.detailAvatarLarge}
              style={{
                backgroundImage: selectedFriend?.profile_img
                  ? `url(${getImageUrl(selectedFriend.profile_img)})`
                  : "none",
              }}
            />
          </div>
          <div className={styles.detailBody}>
            <h4>{selectedFriend?.name}</h4>
            <p>{selectedFriend?.statusMessage || "상태 메시지가 없습니다."}</p>

            {memos[selectedFriend?.id] && !isEditingMemo && (
              <div className={styles.memoDisplay}>
                <p>{memos[selectedFriend.id]}</p>
              </div>
            )}

            {!isEditingMemo ? (
              <button
                className={styles.detailActionBtn}
                onClick={handleMemoEdit}
              >
                {memos[selectedFriend?.id] ? "메모 수정" : "메모 추가"}
              </button>
            ) : (
              <div className={styles.memoInputContainer}>
                <textarea
                  className={styles.memoTextarea}
                  value={tempMemo}
                  onChange={(e) => setTempMemo(e.target.value)}
                  placeholder="이 친구에 대한 메모를 남겨보세요..."
                />
                <div className={styles.memoActions}>
                  <button className={styles.btnSave} onClick={handleSaveMemo}>
                    저장
                  </button>
                  <button
                    className={styles.btnCancel}
                    onClick={handleCancelMemo}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <AddFriendModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {isReportModalOpen && (
        <ReportModal onClose={() => setIsReportModalOpen(false)} />
      )}
    </div>
  );
};

export default FriendsList;
