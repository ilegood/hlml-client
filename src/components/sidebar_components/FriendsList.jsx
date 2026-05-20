import { useRef } from "react";
import styles from "./FriendsList.module.css";
import { getImageUrl } from "../../api/instance";
import AddFriendModal from "../AddFriendModal";
import ReportModal from "../modals/ReportModal";
import { useFriendManagement } from "../../hooks/useFriendManagement";

const FriendsList = () => {
  const {
    isOpen,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    isReportModalOpen,
    setIsReportModalOpen,
    reportedFriend,
    setReportedFriend,
    handleToggleSidebar,
    handleAccept,
    handleReject,
    filteredFriends,
    selectedFriend,
    handleFriendClick,
    activeMenuId,
    setActiveMenuId,
    handleDeleteFriend,
    handleBlockUser,
    handleReport,
    memos,
    isEditingMemo,
    tempMemo,
    setTempMemo,
    handleMemoEdit,
    handleSaveMemo,
    handleCancelMemo,
    handleStartDM,
    cardTop,
    requests,
    menuRef,
  } = useFriendManagement();

  const sidebarRef = useRef(null); // Ref to get sidebar dimensions for cardTop calculation

  const handleClick = (e, friend) => {
    // Pass sidebarRef.current for position calculation
    handleFriendClick(e, friend, sidebarRef.current.getBoundingClientRect());
  };

  return (
    <div className={styles.sidebarWrapper}>
      <div ref={sidebarRef} className={`${styles.friendSidebar} ${isOpen ? styles.active : ""}`}>
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
                    onClick={(e) => handleClick(e, friend)}
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
                            onClick={() => handleReport(friend)}
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

            <button
              className={`${styles.detailActionBtn} ${styles.messageBtn}`}
              onClick={handleStartDM}
              style={{ marginTop: "10px" }}
            >
              메시지 보내기
            </button>
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <AddFriendModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {isReportModalOpen && (
        <ReportModal 
          onClose={() => {
            setIsReportModalOpen(false);
            setReportedFriend(null);
          }} 
          targetUserId={reportedFriend?.id}
          targetName={reportedFriend?.name}
        />
      )}
    </div>
  );
};

export default FriendsList;
