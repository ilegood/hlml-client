import { useState } from "react";
import { getTimeAgo } from "../api/homeConstants";
import { useAuth } from "../context/auth";
import styles from "./CommentItem.module.css";

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

// ── InlineEdit — 수정 폼 (공통) ────────────────────────────
function InlineEdit({ value, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <div className={styles.editMemoWrap}>
      <textarea
        className={styles.editMemoTextarea}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        autoFocus
      />
      <div className={styles.editMemoBtns}>
        <button className={`${styles.editMemoBtn} ${styles.cancel}`} onClick={onCancel}>취소</button>
        <button className={`${styles.editMemoBtn} ${styles.save}`} onClick={() => { if (val.trim()) onSave(val.trim()); }}>저장</button>
      </div>
    </div>
  );
}

// ── ReplyItem ──────────────────────────────────────────────
export function ReplyItem({ reply, commentIdx, replyIdx, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const { userId } = useAuth();

  const isAuthor = String(reply.userId) === String(userId);

  return (
    <div className={styles.replyItemRow}>
      <div className={styles.replyArrow}><ArrowIcon /></div>
      <div className={styles.commentBubble} style={{ flex: 1 }}>
        <div className={styles.commentTop}>
          <span className={styles.commentAuthor}>{reply.author || "익명"}</span>
          {reply.edited && <span className={styles.editedBadge}>수정됨</span>}
          <span className={styles.commentTime}>{getTimeAgo(reply.createdAt)}</span>
        </div>

        {isEditing ? (
          <InlineEdit
            value={reply.text}
            onSave={(text) => { onUpdate(commentIdx, null, null, replyIdx, text); setIsEditing(false); }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className={styles.commentText}>{reply.text}</div>
            <div className={styles.commentActions}>
              {isAuthor && (
                <>
                  <button className={styles.cmtActBtn} onClick={() => setIsEditing(true)}>수정</button>
                  <button className={`${styles.cmtActBtn} ${styles.danger}`} onClick={() => onDelete(commentIdx, replyIdx)}>삭제</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── CommentItem ────────────────────────────────────────────
export function CommentItem({ comment, commentIdx, onUpdate, onDelete }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { userId } = useAuth();

  const isAuthor = String(comment.userId) === String(userId);

  const submitReply = () => {
    if (!replyText.trim()) return;
    onUpdate(commentIdx, replyText.trim());
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <div className={styles.commentItemWrap}>
      <div className={styles.commentBubble}>
        <div className={styles.commentTop}>
          <span className={styles.commentAuthor}>{comment.author || "익명"}</span>
          {comment.edited && <span className={styles.editedBadge}>수정됨</span>}
          <span className={styles.commentTime}>{getTimeAgo(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <InlineEdit
            value={comment.text}
            onSave={(text) => { onUpdate(commentIdx, null, text); setIsEditing(false); }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className={styles.commentText}>{comment.text}</div>
            <div className={styles.commentActions}>
              <button className={styles.cmtActBtn} onClick={() => setReplyOpen(!replyOpen)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 17 4 12 9 7" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                답글
              </button>
              {isAuthor && (
                <>
                  <button className={styles.cmtActBtn} onClick={() => setIsEditing(true)}>수정</button>
                  <button className={`${styles.cmtActBtn} ${styles.danger}`} onClick={() => onDelete(commentIdx)}>삭제</button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {(comment.replies || []).length > 0 && (
        <div className={styles.repliesWrap}>
          {comment.replies.map((r, ri) => (
            <ReplyItem
              key={ri}
              reply={r}
              commentIdx={commentIdx}
              replyIdx={ri}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {replyOpen && (
        <div className={styles.replyInputWrap}>
          <div className={styles.replyArrow}><ArrowIcon /></div>
          <div className={styles.replyInputInner}>
            <input
              className={styles.commentInput}
              placeholder="답글 입력..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              autoFocus
            />
            <button className={styles.commentSubmit} onClick={submitReply}>등록</button>
          </div>
        </div>
      )}
    </div>
  );
}
