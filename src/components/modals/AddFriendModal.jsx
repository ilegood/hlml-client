import { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { searchUsers, addFriend } from "../../api/friends";
import { getImageUrl } from "../../api/instance";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  pointer-events: auto;
`;

const ModalContent = styled.div`
  background: var(--color-sidebar);
  width: 350px;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  color: var(--color-text);
  border: 1px solid var(--color-border);

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    text-align: center;
  }

  .search-box {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  input {
    flex: 1;
    padding: 10px;
    background: var(--color-input-bg);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    outline: none;
    &:focus { border-color: var(--color-active); }
  }

  .results-list {
    max-height: 250px;
    overflow-y: auto;
    margin-bottom: 20px;
    
    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-thumb { background: var(--color-active); border-radius: 10px; }
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    transition: background 0.2s;
    &:hover { background: var(--color-item-hover); }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      background-color: #555;
    }

    .nickname {
      flex: 1;
      font-weight: 500;
      font-size: 14px;
    }

    button {
      padding: 6px 12px;
      background: var(--color-active);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      &:hover { opacity: 0.9; }
    }
  }

  .close-btn {
    width: 100%;
    padding: 10px;
    background: var(--color-border);
    color: var(--color-text);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    &:hover { opacity: 0.8; }
  }

  .empty-msg {
    text-align: center;
    opacity: 0.6;
    font-size: 13px;
    padding: 20px 0;
  }
`;

const AddFriendModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim()) {
      try {
        const data = await searchUsers(val);
        setResults(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResults([]);
    }
  };

  const handleAdd = async (nickname) => {
    try {
      const data = await addFriend(nickname);
      toast.success(data.message || `${nickname}님께 친구 요청을 보냈습니다.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "요청 실패");
    }
  };

  return (
    <ModalOverlay onMouseDown={onClose}>
      <ModalContent onMouseDown={(e) => e.stopPropagation()}>
        <h2>친구 추가</h2>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="닉네임으로 검색" 
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="results-list">
          {results.length > 0 ? (
            results.map(user => (
              <div key={user.id} className="user-item">
                <div 
                  className="avatar" 
                  style={{ backgroundImage: user.profile_img ? `url(${getImageUrl(user.profile_img)})` : 'none' }} 
                />
                <span className="nickname">{user.nickname}</span>
                <button onClick={() => handleAdd(user.nickname)}>추가</button>
              </div>
            ))
          ) : (
            query && <div className="empty-msg">검색 결과가 없습니다.</div>
          )}
        </div>

        <button className="close-btn" onClick={onClose}>닫기</button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddFriendModal;
