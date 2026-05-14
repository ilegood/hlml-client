import { useState, useEffect } from "react";
import styled from "styled-components";
import instance, { getImageUrl } from "../../api/instance";
import { toast } from "sonner";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 420px;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
    position: relative;
  }

  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 25px;
    h2 { font-size: 20px; font-weight: 800; color: #eb4d4b; margin: 0; }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--color-deactive); }
  }

  .form-group {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
    position: relative;
    label { font-size: 13px; font-weight: 700; opacity: 0.8; }
    
    input, select, textarea {
      width: 100%;
      background: var(--color-input-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 14px;
      color: var(--color-text);
      outline: none;
      &:focus { border-color: #eb4d4b; }
    }
    textarea { height: 120px; resize: none; }
  }

  .search-results {
    position: absolute;
    top: calc(100% + 5px);
    left: 0; width: 100%;
    background: var(--color-dropdown-bg);
    border: 1.5px solid #eb4d4b;
    border-radius: 12px;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 10px 25px var(--color-dropdown-shadow);
  }

  .result-item {
    padding: 10px 16px;
    cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    &:hover { background: var(--color-dropdown-hover-bg); }
  }

  .avatar {
    width: 24px; height: 24px; border-radius: 50%;
    background: #eee; overflow: hidden;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }

  .selected-user {
    display: flex; align-items: center; gap: 10px;
    padding: 12px; border: 1.5px solid #eb4d4b;
    border-radius: 12px; background: rgba(235, 77, 75, 0.08);
    .info { flex: 1; font-size: 14px; font-weight: 700; }
    .clear { border: none; background: transparent; color: #eb4d4b; cursor: pointer; font-size: 18px; }
  }

  .submit-btn {
    width: 100%; padding: 16px;
    background: #eb4d4b; color: white;
    border: none; border-radius: 12px;
    font-size: 16px; font-weight: 800;
    cursor: pointer;
    &:disabled { background: #ccc; cursor: not-allowed; }
  }
`;

export default function ReportModal({ onClose, targetUser: initialTarget }) {
  const [targetUser, setTargetUser] = useState(initialTarget || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || targetUser) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await instance.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, targetUser]);

  const handleSubmit = async () => {
    if (!targetUser) return toast.error("신고할 대상을 선택해주세요.");
    if (!reason || reason === "신고 사유를 선택해주세요") return toast.error("신고 사유를 선택해주세요.");
    if (!content.trim()) return toast.error("상세 내용을 입력해주세요.");

    setLoading(true);
    try {
      await instance.post("/reports", {
        targetUserId: targetUser.id || targetUser.user_id,
        reason,
        content,
      });
      toast.success("신고가 접수되었습니다.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "신고 제출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="header">
          <h2>신고하기</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label>신고 대상</label>
          {targetUser ? (
            <div className="selected-user">
              <div className="avatar">
                {targetUser.profile_img && <img src={getImageUrl(targetUser.profile_img)} alt="" />}
              </div>
              <div className="info">{targetUser.nickname || targetUser.name}</div>
              {!initialTarget && (
                <button className="clear" onClick={() => setTargetUser(null)}>&times;</button>
              )}
            </div>
          ) : (
            <>
              <input 
                placeholder="닉네임으로 검색" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.id} className="result-item" onClick={() => { setTargetUser(user); setSearchResults([]); }}>
                      <div className="avatar">
                        {user.profile_img && <img src={getImageUrl(user.profile_img)} alt="" />}
                      </div>
                      <span>{user.nickname}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-group">
          <label>신고 사유</label>
          <select value={reason} onChange={e => setReason(e.target.value)}>
            <option>신고 사유를 선택해주세요</option>
            <option>부적절한 닉네임</option>
            <option>스팸/광고</option>
            <option>욕설 및 비하 발언</option>
            <option>노쇼 (약속 미이행)</option>
            <option>기타</option>
          </select>
        </div>

        <div className="form-group">
          <label>상세 내용</label>
          <textarea 
            placeholder="구체적인 상황을 설명해주세요"
            value={content}
            onChange={e => setContent(e.target.value)}
          ></textarea>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "제출 중..." : "신고 제출"}
        </button>
      </div>
    </ModalWrapper>
  );
}
