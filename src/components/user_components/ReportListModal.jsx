import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import instance, { getImageUrl } from "../../api/instance";
import { useAuth } from "../../context/AuthContext";

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 480px;
    max-width: calc(100vw - 32px);
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
  }

  .header,
  .title-row,
  .item-top,
  .reported-user,
  .go-report-btn,
  .selected-user-card,
  .result-item {
    display: flex;
    align-items: center;
  }

  .header {
    justify-content: space-between;
    margin-bottom: 25px;
  }

  .title-row {
    gap: 10px;
  }

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: #eb4d4b;
    margin: 0;
  }

  .back-btn,
  .close-btn,
  .clear-selected-user {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-deactive);
  }

  .back-btn:hover,
  .close-btn:hover,
  .clear-selected-user:hover {
    color: #eb4d4b;
  }

  .report-list-container,
  .report-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .report-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 5px;
    scrollbar-width: none;
  }

  .report-list::-webkit-scrollbar {
    display: none;
  }

  .report-item,
  .selected-user-card {
    background: var(--color-input-bg);
    border: 1.5px solid var(--color-border);
    border-radius: 16px;
  }

  .report-item {
    padding: 16px;
  }

  .item-top {
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
  }

  .reported-user,
  .selected-user-card,
  .result-item {
    gap: 10px;
    min-width: 0;
  }

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #eee;
    flex: 0 0 auto;
    overflow: hidden;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .name,
  .selected-user-meta strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name {
    font-size: 15px;
    font-weight: 800;
  }

  .status-badge {
    flex: 0 0 auto;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    background: #fff5f5;
    color: #eb4d4b;
  }

  .summary {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .reason,
  .date,
  .selected-user-meta span {
    color: var(--color-deactive);
  }

  .reason {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .content {
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.9;
  }

  .date {
    margin-top: 10px;
    font-size: 11px;
    text-align: right;
  }

  .empty {
    text-align: center;
    padding: 40px 0;
  }

  .empty .icon {
    font-size: 40px;
    margin-bottom: 15px;
    display: block;
  }

  .empty p {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-deactive);
  }

  .list-footer {
    padding-top: 10px;
    border-top: 1.5px solid var(--color-border);
  }

  .go-report-btn,
  .submit-btn {
    width: 100%;
    padding: 14px;
    background: #eb4d4b;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
  }

  .go-report-btn {
    justify-content: center;
    gap: 8px;
  }

  .go-report-btn:hover,
  .submit-btn:hover {
    opacity: 0.9;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.8;
  }

  input,
  select,
  textarea {
    width: 100%;
    background: var(--color-input-bg);
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--color-text);
    outline: none;
    font-family: inherit;
  }

  select {
    padding-right: 44px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #eb4d4b;
  }

  textarea {
    height: 120px;
    resize: none;
  }

  .search-results {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    background: var(--color-dropdown-bg);
    color: var(--color-dropdown-text);
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
  }

  .result-item:hover {
    background: var(--color-dropdown-hover-bg);
    color: var(--color-dropdown-hover-text);
  }

  .searching {
    font-size: 11px;
    padding: 5px 10px;
    opacity: 0.6;
  }

  .selected-user-card {
    padding: 12px;
    border-color: #eb4d4b;
    background: rgba(235, 77, 75, 0.08);
  }

  .selected-user-card .avatar {
    width: 36px;
    height: 36px;
  }

  .selected-user-meta {
    flex: 1;
    min-width: 0;
  }

  .selected-user-meta strong,
  .selected-user-meta span {
    display: block;
  }

  .selected-user-meta strong {
    font-size: 14px;
  }

  .selected-user-meta span {
    font-size: 12px;
    font-weight: 700;
  }

  .clear-selected-user {
    font-size: 20px;
    line-height: 1;
    padding: 4px;
  }
`;

const REASON_PLACEHOLDER = "신고 사유를 선택해주세요";

const formatReportDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReportTypeLabel = (report) => {
  if (report.reportType === "post") return "게시글";
  if (report.reportType === "comment") return "댓글";
  return "사용자";
};

const getReportSummary = (report) => {
  const typeLabel = getReportTypeLabel(report);
  if (report.reportType === "post") {
    return `${typeLabel} 신고 접수완료`;
  }
  if (report.reportType === "comment") {
    return `${typeLabel} 신고 접수완료`;
  }
  return `${report.targetName} 신고 접수완료`;
};

export default function ReportListModal({ onClose, onChanged }) {
  const { token } = useAuth();
  const [view, setView] = useState("list");
  const [reports, setReports] = useState([]);
  const [targetUser, setTargetUser] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [targetProfileImg, setTargetProfileImg] = useState("");
  const [targetReportCount, setTargetReportCount] = useState(0);
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedUser = useMemo(
    () =>
      targetUserId
        ? {
            id: targetUserId,
            nickname: targetUser,
            profile_img: targetProfileImg,
            report_count: targetReportCount,
          }
        : null,
    [targetProfileImg, targetReportCount, targetUser, targetUserId],
  );

  const fetchReports = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await instance.get("/reports/my");
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Report list load failed:", err);
      toast.error("신고 내역을 불러오지 못했습니다.");
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!targetUser.trim() || targetUserId || !token) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await instance.get(
          `/users/search?q=${encodeURIComponent(targetUser)}`,
        );
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [targetUser, targetUserId, token]);

  const resetForm = () => {
    setTargetUser("");
    setTargetUserId(null);
    setTargetProfileImg("");
    setTargetReportCount(0);
    setReason("");
    setContent("");
    setSearchResults([]);
  };

  const selectUser = (user) => {
    const selectedId = user.user_id ?? user.id;

    if (!selectedId) {
      toast.error("유저 정보를 확인할 수 없습니다.");
      return;
    }

    setTargetUser(user.nickname);
    setTargetUserId(selectedId);
    setTargetProfileImg(user.profile_img || "");
    setTargetReportCount(Number(user.report_count) || 0);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!targetUserId) {
      toast.error("검색 결과에서 유저를 선택해주세요.");
      return;
    }
    if (!reason || reason === REASON_PLACEHOLDER) {
      toast.error("신고 사유를 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("상세 내용을 입력해주세요.");
      return;
    }

    try {
      await instance.post("/reports", {
        targetUserId,
        reason,
        content: content.trim(),
      });

      toast.success(`${targetUser}님 신고가 접수되었습니다.`);
      resetForm();
      setView("list");
      fetchReports();
      onChanged?.();
    } catch (err) {
      console.error("Report submit failed:", err);
      toast.error(err.response?.data?.message || "신고 접수에 실패했습니다.");
    }
  };

  return (
    <ModalWrapper onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="header">
          <div className="title-row">
            {view === "form" && (
              <button className="back-btn" onClick={() => setView("list")}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <h2>{view === "list" ? "신고 내역" : "새 신고하기"}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {view === "list" ? (
          <div className="report-list-container">
            <div className="report-list">
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <div
                    key={report.id || `${report.targetUserId}-${index}`}
                    className="report-item"
                  >
                    <div className="item-top">
                      <div className="reported-user">
                        <div className="avatar">
                          {report.targetProfileImg && (
                            <img
                              src={getImageUrl(report.targetProfileImg)}
                              alt=""
                            />
                          )}
                        </div>
                        <span className="name">{report.targetName}</span>
                      </div>
                      <span className="status-badge">접수완료</span>
                    </div>
                    <div className="summary">{getReportSummary(report)}</div>
                    {report.targetTitle && (
                      <div className="reason">게시글: {report.targetTitle}</div>
                    )}
                    {report.targetExcerpt && (
                      <div className="content">"{report.targetExcerpt}"</div>
                    )}
                    {report.reportCount !== undefined && (
                      <div className="reason">
                        누적 신고 횟수 {report.reportCount}회
                      </div>
                    )}
                    <div className="reason">{report.reason}</div>
                    <div className="content">{report.content}</div>
                    <div className="date">
                      {formatReportDate(report.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <span className="icon">!</span>
                  <p>최근 24시간 신고 내역이 없습니다.</p>
                </div>
              )}
            </div>
            <div className="list-footer">
              <button className="go-report-btn" onClick={() => setView("form")}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
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
                onChange={(e) => {
                  setTargetUser(e.target.value);
                  setTargetUserId(null);
                  setTargetProfileImg("");
                }}
                autoComplete="off"
              />
              {selectedUser && (
                <div className="selected-user-card">
                  <div className="avatar">
                    {selectedUser.profile_img && (
                      <img src={getImageUrl(selectedUser.profile_img)} alt="" />
                    )}
                  </div>
                  <div className="selected-user-meta">
                    <strong>{selectedUser.nickname}</strong>
                    <span>신고 대상 선택됨</span>
                    <span>
                      현재 신고 횟수 {selectedUser.report_count || 0}회
                    </span>
                  </div>
                  <button
                    type="button"
                    className="clear-selected-user"
                    onClick={() => {
                      setTargetUser("");
                      setTargetUserId(null);
                      setTargetProfileImg("");
                      setTargetReportCount(0);
                    }}
                    title="선택 해제"
                  >
                    x
                  </button>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user, index) => (
                    <div
                      key={`${user.user_id ?? user.id}-${index}`}
                      className="result-item"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectUser(user);
                      }}
                    >
                      <div className="avatar">
                        {user.profile_img && (
                          <img src={getImageUrl(user.profile_img)} alt="" />
                        )}
                      </div>
                      <span>{user.nickname}</span>
                    </div>
                  ))}
                </div>
              )}
              {isSearching && <div className="searching">검색 중...</div>}
            </div>

            <div className="form-group">
              <label>신고 사유</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option>{REASON_PLACEHOLDER}</option>
                <option>부적절한 닉네임</option>
                <option>스팸/광고</option>
                <option>욕설 및 비하 발언</option>
                <option>노쇼 및 약속 미이행</option>
                <option>기타</option>
              </select>
            </div>

            <div className="form-group">
              <label>상세 내용</label>
              <textarea
                placeholder="구체적인 상황을 설명해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
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
