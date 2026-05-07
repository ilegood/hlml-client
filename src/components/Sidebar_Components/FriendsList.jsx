import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import friendsData from "../../api/friendsData";
import styles from "./FriendsList.module.css";

const CATEGORIES = [
  { label: "온라인 ▾", status: "online" },
  { label: "오프라인", status: "offline" },
];

const FriendsList = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [memos, setMemos] = useState({});
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState("");
  const sidebarOpen = Boolean(token && isOpen);
  const activeFriend = token ? selectedFriend : null;

  const filteredFriends = friendsData.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFriendClick = (friend) => {
    if (!token) return;
    if (activeFriend?.id === friend.id) {
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
    if (sidebarOpen) setSelectedFriend(null);
    setIsOpen((prev) => !prev);
  };

  const handleMemoEdit = () => {
    if (!activeFriend) return;
    setTempMemo(memos[activeFriend.id] || "");
    setIsEditingMemo(true);
  };

  const handleSaveMemo = () => {
    setMemos((prev) => ({ ...prev, [selectedFriend.id]: tempMemo }));
    setIsEditingMemo(false);
  };

  return (
    <div className={styles.sidebarWrapper}>
      <div
        className={`${styles.friendSidebar}${sidebarOpen ? ` ${styles.active}` : ""}`}
      >
        {/* ── Toggle Button ── */}
        <button
          className={`${styles.toggleBtn}${!token ? ` ${styles.locked}` : ""}`}
          onClick={handleToggleSidebar}
        >
          {sidebarOpen ? "〉" : "〈"}
        </button>

        {/* ── Search ── */}
        <div className={styles.searchSection}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={token ? "친구 검색" : "로그인 후 이용 가능"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!token}
          />
        </div>

        {/* ── Friend List ── */}
        <div className={styles.scrollContainer}>
          {token ? (
            CATEGORIES.map(({ label, status }) => {
              const friends = filteredFriends.filter(
                (f) => f.status === status,
              );
              return (
                <div className={styles.categorySection} key={status}>
                  <h3 className={styles.categoryTitle}>{label}</h3>
                  <table className={styles.friendTable}>
                    <tbody>
                      {friends.map((friend) => (
                        <tr
                          key={friend.id}
                          className={`${styles.friendRow}${activeFriend?.id === friend.id ? ` ${styles.active}` : ""}`}
                          onClick={() => handleFriendClick(friend)}
                        >
                          <td className={styles.avatarCell}>
                            <div className={styles.avatar} />
                          </td>
                          <td className={styles.nameCell}>{friend.name}</td>
                          <td className={styles.statusCell}>
                            <div
                              className={`${styles.statusSquare} ${styles[status]}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyLogin}>
              로그인 후 친구 목록을 확인하세요.
            </div>
          )}
        </div>

        {/* ── Friend Detail Card ── */}
        <div
          className={`${styles.friendDetailCard}${!activeFriend ? ` ${styles.hidden}` : ""}`}
        >
          <div className={styles.detailHeader}>
            <div className={styles.detailAvatarLarge} />
          </div>
          <div className={styles.detailBody}>
            <h4>{activeFriend?.name}</h4>
            <p>{activeFriend?.statusMessage || "상태 메시지가 없습니다."}</p>
            <div className={styles.detailIcons}>
              <span>안녕하세요.</span>
            </div>

            {memos[activeFriend?.id] && !isEditingMemo && (
              <div className={styles.memoDisplay}>
                <p>{memos[activeFriend.id]}</p>
              </div>
            )}

            {!isEditingMemo ? (
              <button
                className={styles.detailActionBtn}
                onClick={handleMemoEdit}
              >
                {memos[activeFriend?.id] ? "메모 수정" : "메모 추가"}
              </button>
            ) : (
              <div>
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
                    onClick={() => setIsEditingMemo(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
