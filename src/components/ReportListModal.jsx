import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/auth";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 480px;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
  }

  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 25px;
    
    .title-row {
      display: flex; align-items: center; gap: 10px;
      h2 { font-size: 20px; font-weight: 800; color: #eb4d4b; margin: 0; }
      .back-btn { 
        background: none; border: none; cursor: pointer; padding: 0;
        color: var(--color-deactive); display: flex; align-items: center;
        &:hover { color: var(--color-text); }
      }
    }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--color-deactive); }
  }

  /* ── 리스트 뷰 ── */
  .report-list-container {
    display: flex; flex-direction: column; gap: 20px;
  }

  .report-list {
    display: flex; flex-direction: column; gap: 12px;
    max-height: 400px; overflow-y: auto;
    padding-right: 5px;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar { display: none; }
  }
      padding: 16px;
      background: var(--color-input-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 16px;
      transition: all 0.2s;

      &:hover { border-color: #eb4d4b; }

      .item-top {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 8px;
        
        .reported-user {
          display: flex; align-items: center; gap: 8px;
          .avatar { width: 24px; height: 24px; border-radius: 50%; background: #eee; }
          .name { font-size: 15px; font-weight: 700; color: var(--color-text); }
        }

        .status-badge {
          padding: 4px 8px; border-radius: 8px;
          font-size: 11px; font-weight: 800;
          &.pending { background: #fff5f5; color: #eb4d4b; }
          &.resolved { background: #f0fdf4; color: #16a34a; }
        }
      }

      .reason { font-size: 13px; font-weight: 600; color: var(--color-deactive); margin-bottom: 6px; }
      .content { font-size: 14px; line-height: 1.5; color: var(--color-text); opacity: 0.9; }
      .date { margin-top: 10px; font-size: 11px; color: var(--color-deactive); text-align: right; }
    }
  }

  .list-footer {
    padding-top: 10px;
    border-top: 1.5px solid var(--border-color, var(--color-border));
  }

  .go-report-btn {
    width: 100%; padding: 14px;
    background: #eb4d4b; color: white;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 800;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    &:hover { opacity: 0.9; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  }

  /* ── 작성 폼 뷰 ── */
  .report-form {
    display: flex; flex-direction: column; gap: 20px;

    .form-group {
      display: flex; flex-direction: column; gap: 8px;
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
        font-family: inherit;
        &:focus { border-color: #eb4d4b; }
      }
      textarea { height: 120px; resize: none; }

      .search-results {
        position: absolute;
        top: calc(100% + 5px);
        left: 0; width: 100%;
        background: var(--color-sidebar);
        border: 1.5px solid var(--color-border);
        border-radius: 12px;
        z-index: 10;
        max-height: 200px;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);

        .result-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          &:hover { background: var(--color-input-bg); color: #eb4d4b; }
          .avatar { width: 24px; height: 24px; border-radius: 50%; background: #eee; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
          span { font-size: 14px; font-weight: 600; }
        }
      }
    }

    .submit-btn {
      width: 100%; padding: 16px;
      background: #eb4d4b; color: white;
      border: none; border-radius: 12px;
      font-size: 16px; font-weight: 800;
      cursor: pointer;
      &:hover { opacity: 0.9; }
    }
  }

  .empty {
    text-align: center; padding: 40px 0;
    .icon { font-size: 40px; margin-bottom: 15px; display: block; }
    p { font-size: 15px; font-weight: 600; color: var(--color-deactive); }
  }
`;

export default function ReportListModal({ onClose }) {
  const { token } = useAuth();
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [targetUser, setTargetUser] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 실시간 검색 로직
  useEffect(() => {
    const searchUsers = async () => {
      if (!targetUser.trim() || targetUserId) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axios.get(`http://localhost:4000/users/search?q=${targetUser}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [targetUser, targetUserId, token]);

  const selectUser = (user) => {
    setTargetUser(user.nickname);
    setTargetUserId(user.user_id);
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    setTargetUser(e.target.value);
    setTargetUserId(null); // 입력 내용이 바뀌면 선택된 ID 초기화
  };

  // 샘플 데이터
  const reports = [
    {
      id: 1,
      targetName: "김미나",
      reason: "노쇼 (약속 미이행)",
      content: "약속 시간 30분이 지나도 나타나지 않고 연락도 받지 않았습니다.",
      status: "pending",
      date: "2026.04.28"
    },
    {
      id: 2,
      targetName: "박철수",
      reason: "욕설 및 비하 발언",
      content: "채팅창에서 지속적으로 비하 발언을 하였습니다.",
      status: "resolved",
      date: "2026.04.25"
    }
  ];

  const handleSubmit = () => {
    if (!targetUserId) return toast.error("검색 결과에서 유저를 선택해주세요.");
    if (!reason || reason === "신고 사유를 선택해주세요") return toast.error("신고 사유를 선택해주세요.");
    if (!content.trim()) return toast.error("상세 내용을 입력해주세요.");

    toast.success(`${targetUser} 님에 대한 신고가 접수되었습니다.`);
    setView("list");
    setTargetUser("");
    setTargetUserId(null);
    setReason("");
    setContent("");
  };

  return (
    <ModalWrapper onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="header">
          <div className="title-row">
            {view === "form" && (
              <button className="back-btn" onClick={() => setView("list")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <h2>{view === "list" ? "신고 내역" : "새 신고하기"}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {view === "list" ? (
          <div className="report-list-container">
            <div className="report-list">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="report-item">
                    <div className="item-top">
                      <div className="reported-user">
                        <div className="avatar"></div>
                        <span className="name">{report.targetName}</span>
                      </div>
                      <span className={`status-badge ${report.status}`}>
                        {report.status === "pending" ? "처리중" : "처리완료"}
                      </span>
                    </div>
                    <div className="reason">{report.reason}</div>
                    <div className="content">{report.content}</div>
                    <div className="date">{report.date}</div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <span className="icon">📄</span>
                  <p>신고 내역이 없습니다.</p>
                </div>
              )}
            </div>
            <div className="list-footer">
              <button className="go-report-btn" onClick={() => setView("form")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                새로운 신고 제출하기
              </button>
            </div>
          </div>
        ) : (
          <div className="report-form">
            <div className="form-group">
              <label>유저 검색</label>
              <input 
                type="text" 
                placeholder="신고할 유저의 닉네임을 입력하세요"
                value={targetUser}
                onChange={handleInputChange}
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(user => (
                    <div key={user.user_id} className="result-item" onClick={() => selectUser(user)}>
                      <div className="avatar">
                        {user.profile_img ? (
                          <img src={`http://localhost:4000${user.profile_img}`} alt="" />
                        ) : null}
                      </div>
                      <span>{user.nickname}</span>
                    </div>
                  ))}
                </div>
              )}
              {isSearching && <div style={{fontSize: '11px', padding: '5px 10px', opacity: 0.5}}>검색 중...</div>}
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

            <button className="submit-btn" onClick={handleSubmit}>
              신고 제출
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
