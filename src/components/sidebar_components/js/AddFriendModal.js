import { useState } from "react";
import { toast } from "sonner";
import { addFriend, searchUsers } from "../../../api/friends";
import ProfileAvatar from "../../ProfileAvatar";
import styles from "../css/AddFriendModal.module.css";

const AddFriendModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setResults(await searchUsers(value));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (nickname) => {
    try {
      const data = await addFriend(nickname);
      toast.success(
        data.message || `${nickname}님에게 친구 요청을 보냈습니다.`,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "친구 요청에 실패했습니다.");
    }
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>친구 추가</h2>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="닉네임으로 검색"
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.resultsList}>
          {results.length > 0
            ? results.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <ProfileAvatar
                    profileImg={user.profile_img}
                    nickname={user.nickname}
                    size={40}
                    className={styles.avatar}
                  />
                  <span className={styles.nickname}>{user.nickname}</span>
                  <button
                    className={styles.addButton}
                    onClick={() => handleAdd(user.nickname)}
                  >
                    추가
                  </button>
                </div>
              ))
            : query && (
                <div className={styles.emptyMessage}>검색 결과가 없습니다.</div>
              )}
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default AddFriendModal;
