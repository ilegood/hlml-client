import { useState, useRef, useEffect } from "react";
import { getTimeAgo } from "../../api/homeConstants";
import { useAuth } from "../../context/AuthContext";
import styles from "./CommentItem.module.css";

const ArrowIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────
function renderTextWithLinks(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageRegex = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      let displayImageUrl = null;

      // 1. Direct image link (with optional query params)
      if (imageRegex.test(part)) {
        displayImageUrl = part;
      }
      // 2. Google Image Search Result handling
      else if (
        part.includes("google.com/imgres") ||
        part.includes("google.com/search")
      ) {
        try {
          const url = new URL(part);
          // Case A: Direct result page with imgurl
          const imgUrlParam = url.searchParams.get("imgurl");
          if (imgUrlParam) {
            displayImageUrl = imgUrlParam;
          }
          // Case B: Search results page with thumbnail ID (tbnid)
          else {
            const tbnid = url.searchParams.get("tbnid");
            if (tbnid) {
              displayImageUrl = `https://encrypted-tbn0.gstatic.com/images?q=tbn:${tbnid}`;
            }
          }
        } catch {
          displayImageUrl = null;
        }
      }
      // 3. Instagram/Social media lookaside often don't have extensions but are images
      else if (part.includes("lookaside.instagram.com")) {
        displayImageUrl = part;
      }

      return (
        <div key={i} style={{ display: "inline" }}>
          <a
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-active)",
              textDecoration: "underline",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
          {displayImageUrl && (
            <img
              src={displayImageUrl}
              alt="comment attachment"
              className={styles.commentImg}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                // If image fails to load, hide it
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
      );
    }
    return part;
  });
}

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
        <button
          className={`${styles.editMemoBtn} ${styles.cancel}`}
          onClick={onCancel}
        >
          취소
        </button>
        <button
          className={`${styles.editMemoBtn} ${styles.save}`}
          onClick={() => {
            if (val.trim()) onSave(val.trim());
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

// ── ReplyItem ──────────────────────────────────────────────
function ReplyItem({
  reply,
  commentIdx,
  replyIdx,
  onUpdate,
  onDelete,
  onReport,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef(null);
  const { userId } = useAuth();

  const isAuthor = String(reply.userId) === String(userId);

  useEffect(() => {
    if (textRef.current) {
      setNeedsTruncation(
        textRef.current.scrollHeight > textRef.current.offsetHeight,
      );
    }
  }, [reply.text]);

  return (
    <div className={styles.replyItemRow}>
      <div className={styles.replyArrow}>
        <ArrowIcon />
      </div>
      <div className={styles.commentBubble} style={{ flex: 1 }}>
        <div className={styles.commentTop}>
          <span className={styles.commentAuthor}>
            {reply.authorNickname || "익명"}
          </span>
          {reply.edited && <span className={styles.editedBadge}>수정됨</span>}
          <span className={styles.commentTime}>
            {getTimeAgo(reply.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <InlineEdit
            value={reply.text}
            onSave={(text) => {
              onUpdate(commentIdx, null, null, replyIdx, text);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div
              ref={textRef}
              className={`${styles.commentText} ${!isExpanded ? styles.commentTextCollapsed : ""}`}
            >
              {renderTextWithLinks(reply.text)}
            </div>
            {reply.image && (
              <img
                src={reply.image}
                alt="comment"
                className={styles.commentImg}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {needsTruncation && (
              <button
                className={styles.seeMoreBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "간략히 보기" : "더보기"}
              </button>
            )}
            <div className={styles.commentActions}>
              {isAuthor ? (
                <>
                  <button
                    className={styles.cmtActBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    수정
                  </button>
                  <button
                    className={`${styles.cmtActBtn} ${styles.danger}`}
                    onClick={() => onDelete(commentIdx, replyIdx)}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  className={`${styles.cmtActBtn} ${styles.danger}`}
                  onClick={() => onReport?.(reply)}
                >
                  신고
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── CommentItem ────────────────────────────────────────────
export function CommentItem({
  comment,
  commentIdx,
  onUpdate,
  onDelete,
  onReport,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef(null);
  const { userId } = useAuth();

  const isAuthor = String(comment.userId) === String(userId);

  useEffect(() => {
    if (textRef.current) {
      setNeedsTruncation(
        textRef.current.scrollHeight > textRef.current.offsetHeight,
      );
    }
  }, [comment.text]);

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
          <span className={styles.commentAuthor}>
            {comment.authorNickname || "익명"}
          </span>
          {comment.edited && <span className={styles.editedBadge}>수정됨</span>}
          <span className={styles.commentTime}>
            {getTimeAgo(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <InlineEdit
            value={comment.text}
            onSave={(text) => {
              onUpdate(commentIdx, null, text);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div
              ref={textRef}
              className={`${styles.commentText} ${!isExpanded ? styles.commentTextCollapsed : ""}`}
            >
              {renderTextWithLinks(comment.text)}
            </div>
            {comment.image && (
              <img
                src={comment.image}
                alt="comment"
                className={styles.commentImg}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {needsTruncation && (
              <button
                className={styles.seeMoreBtn}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "간략히 보기" : "더보기"}
              </button>
            )}
            <div className={styles.commentActions}>
              <button
                className={styles.cmtActBtn}
                onClick={() => setReplyOpen(!replyOpen)}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 17 4 12 9 7" />
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                </svg>
                답글
              </button>
              {isAuthor ? (
                <>
                  <button
                    className={styles.cmtActBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    수정
                  </button>
                  <button
                    className={`${styles.cmtActBtn} ${styles.danger}`}
                    onClick={() => onDelete(commentIdx)}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  className={`${styles.cmtActBtn} ${styles.danger}`}
                  onClick={() => onReport?.(comment)}
                >
                  신고
                </button>
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
              onReport={onReport}
            />
          ))}
        </div>
      )}

      {replyOpen && (
        <div className={styles.replyInputWrap}>
          <div className={styles.replyArrow}>
            <ArrowIcon />
          </div>
          <div className={styles.replyInputInner}>
            <input
              className={styles.commentInput}
              placeholder="답글 입력..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              autoFocus
            />
            <button className={styles.commentSubmit} onClick={submitReply}>
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
