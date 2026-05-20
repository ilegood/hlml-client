import { useState } from "react";
import { toast } from "sonner";
import styled from "styled-components";
import instance, { getImageUrl } from "../../api/instance";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 4000;
  backdrop-filter: blur(4px);
  pointer-events: auto;

  .modal-content {
    background: var(--color-sidebar);
    width: 420px;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
  }

  .header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 25px;
    h2 { font-size: 20px; font-weight: 800; color: #eb4d4b; }
    .close-btn { background: none; border: none; cursor: pointer; color: var(--color-deactive); }
  }

  .target-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--color-input-bg);
    border-radius: 12px;
    margin-bottom: 20px;
    img {
      width: 36px; height: 36px;
      border-radius: 50%;
      object-fit: cover;
      background: #555;
    }
    .target-avatar-placeholder {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #555;
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px;
      flex-shrink: 0;
    }
    .target-name {
      font-weight: 700; font-size: 14px;
    }
  }

  .form-group {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
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
    textarea { height: 120px; resize: none; }
  }

  .submit-btn {
    width: 100%; padding: 16px;
    background: #eb4d4b; color: white;
    border: none; border-radius: 12px;
    font-size: 16px; font-weight: 800;
    cursor: pointer;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

export default function ReportModal({ onClose, targetUser }) {
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || reason === "신고 사유를 선택해주세요") {
      toast.error("신고 사유를 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("상세 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await instance.post("/reports", {
        targetUserId: targetUser.user_id,
        reason,
        content: content.trim(),
      });
      toast.success("신고가 접수되었습니다.");
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "신고 접수에 실패했습니다.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={e => e.stopPropagation()}>
        <div className="header">
          <h2>신고하기</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {targetUser && (
          <div className="target-info">
            {targetUser.profile_img ? (
              <img src={getImageUrl(targetUser.profile_img)} alt={targetUser.nickname} />
            ) : (
              <div className="target-avatar-placeholder">
                {(targetUser.nickname || "?").slice(0, 1)}
              </div>
            )}
            <span className="target-name">{targetUser.nickname}</span>
          </div>
        )}

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
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="구체적인 상황을 설명해주세요"
          />
        </div>

        <button className="submit-btn" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "제출 중..." : "신고 제출"}
        </button>
      </div>
    </ModalWrapper>
  );
}
