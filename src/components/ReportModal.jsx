import { useState, useEffect } from "react";
import styled from "styled-components";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 450px;
    max-height: 80vh;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
    flex-shrink: 0;
    h2 { font-size: 20px; font-weight: 800; color: #eb4d4b; margin: 0; }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--color-deactive); }
  }

  .content-body {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 10px;
    }
  }

  /* History View Styles */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    background: var(--color-input-bg);
    border: 1.5px solid var(--color-border);
    border-radius: 16px;
    padding: 16px;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-deactive);
    }

    .status {
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 11px;
      background: #eee;
      color: #666;

      &.pending { background: #fff5f5; color: #eb4d4b; }
      &.completed { background: #f0fff4; color: #38a169; }
    }

    .item-content {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .item-detail {
      font-size: 13px;
      opacity: 0.7;
    }
  }

  .empty-history {
    text-align: center;
    padding: 40px 0;
    opacity: 0.5;
    font-size: 14px;
  }

  /* Create View Styles */
  .search-section {
    margin-bottom: 20px;
    position: relative;
    
    input {
      width: 100%;
      background: var(--color-input-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 12px;
      padding: 12px 16px;
      padding-left: 40px;
      font-size: 14px;
      color: var(--color-text);
      outline: none;
      &:focus { border-color: #eb4d4b; }
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-deactive);
    }
  }

  .user-list {
    max-height: 180px;
    overflow-y: auto;
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    margin-bottom: 20px;
    background: var(--color-input-bg);
  }

  .user-item {
    padding: 12px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover { background: var(--color-border); }
    &.selected {
      background: #eb4d4b;
      color: white;
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ddd;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
  }

  .form-group {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
    label { font-size: 13px; font-weight: 700; opacity: 0.8; }
    
    select, textarea {
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
    textarea { height: 100px; resize: none; }
  }

  .footer-btns {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-shrink: 0;
  }

  .btn {
    flex: 1; padding: 14px;
    border: none; border-radius: 12px;
    font-size: 15px; font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-btn { background: #eb4d4b; color: white; &:hover { opacity: 0.9; } }
  .secondary-btn { 
    background: var(--color-border); 
    color: var(--color-text); 
    &:hover { background: #ddd; } 
  }

  .back-btn {
    background: none; border: none; cursor: pointer; color: var(--color-deactive);
    display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600;
    padding: 0; margin-bottom: 15px;
    &:hover { color: var(--color-text); }
  }
`;

// Mock Reports History
const MOCK_HISTORY = [
  { id: 1, date: '2024.04.20', target: '김철수', reason: '욕설 및 비하 발언', status: 'completed', statusText: '처리 완료' },
  { id: 2, date: '2024.04.25', target: '이영희', reason: '노쇼 (약속 미이행)', status: 'pending', statusText: '접수 완료' },
];

// Mock Users for Search (In a real app, fetch from DB)
const MOCK_USERS = [
  { id: 101, nickname: '가나다' },
  { id: 102, nickname: '강아지' },
  { id: 103, nickname: '나비' },
  { id: 104, nickname: '다람쥐' },
  { id: 105, nickname: '라마' },
  { id: 106, nickname: '마법사' },
  { id: 107, nickname: '바다' },
  { id: 108, nickname: '사과' },
  { id: 109, nickname: '아기' },
  { id: 110, nickname: '자전거' },
];

export default function ReportModal({ onClose }) {
  const [view, setView] = useState('history'); // 'history' | 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const filteredUsers = MOCK_USERS
    .filter(user => user.nickname.includes(searchTerm))
    .sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'));

  const handleSubmit = () => {
    if (!selectedUser) return alert('신고 대상자를 선택해주세요.');
    if (!reason || reason === '신고 사유를 선택해주세요') return alert('신고 사유를 선택해주세요.');
    
    alert(`${selectedUser.nickname}님에 대한 신고가 접수되었습니다.`);
    setView('history');
    // Reset form
    setSelectedUser(null);
    setSearchTerm('');
    setReason('');
    setDetails('');
  };

  return (
    <ModalWrapper onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="header">
          <h2>{view === 'history' ? '신고 내역' : '신고하기'}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="content-body">
          {view === 'history' ? (
            <div className="history-list">
              {MOCK_HISTORY.length > 0 ? (
                MOCK_HISTORY.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="item-header">
                      <span>{item.date}</span>
                      <span className={`status ${item.status}`}>{item.statusText}</span>
                    </div>
                    <div className="item-content">
                      {item.target} 님에 대한 신고
                    </div>
                    <div className="item-detail">
                      사유: {item.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-history">신고 내역이 없습니다.</div>
              )}
            </div>
          ) : (
            <div className="create-form">
              <button className="back-btn" onClick={() => setView('history')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                뒤로가기
              </button>

              <div className="search-section">
                <div className="search-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="신고할 대상을 검색하세요" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="user-list">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-avatar"></div>
                      {user.nickname}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '14px', opacity: 0.5 }}>
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>신고 사유</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
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
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        <div className="footer-btns">
          {view === 'history' ? (
            <button className="btn primary-btn" onClick={() => setView('create')}>
              신고하기
            </button>
          ) : (
            <button className="btn primary-btn" onClick={handleSubmit}>
              제출하기
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
