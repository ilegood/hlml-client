import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  getTimeAgo,
  countComments,
  formatDateTime,
  STATUS_LIST,
  STATUS_EMOJI,
  STATUS_CLASS,
} from "../api/homeConstants";
import { getPost, deletePost, updatePost } from "../api/posts";
import CategorySelector from "../components/CategorySelector";
import ImageDropZone from "../components/ImageDropZone";

// ── Animations ────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

// ── Single Wrapper Styled Component ──────────────────────
const DetailStyles = styled.div`
  /* ── Layout ── */
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
  }

  /* ── Top Nav ── */
  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .back-btn,
  .more-btn {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text);
    transition: background 0.15s;
  }
  .back-btn:hover,
  .more-btn:hover {
    background: var(--color-border);
  }

  .more-menu-wrap {
    position: relative;
  }

  .more-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--color-sidebar);
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
    overflow: hidden;
    min-width: 100px;
    z-index: 100;
    animation: ${modalIn} 0.12s ease;
  }

  .more-item {
    padding: 11px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.1s;
    font-weight: 500;
    color: var(--color-text);
  }
  .more-item:hover {
    background: var(--color-item-hover);
  }
  .more-item.delete {
    color: #ff4757;
  }

  /* ── Image & Body ── */
  .detail-img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 18px;
    margin-bottom: 20px;
    display: block;
  }

  .detail-body {
    background: var(--color-sidebar);
    border-radius: 20px;
    border: 1.5px solid var(--color-border);
    padding: 30px;
    margin-bottom: 20px;
  }

  /* ── Status & Tags ── */
  .status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
  }
  .status-badge.status-open {
    background: #e8fdf0;
    color: #1a8a44;
  }
  .status-badge.status-full {
    background: #fff0f1;
    color: #c0392b;
  }

  .edited-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    color: #aaa;
    background: var(--color-sidebar);
    border: 1px solid var(--color-border);
    padding: 1px 6px;
    border-radius: 10px;
  }
  .edited-badge.sm {
    font-size: 9px;
    padding: 1px 5px;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: var(--color-input-bg);
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }

  /* ── Title ── */
  .detail-title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 20px;
    color: var(--color-text);
  }

  /* ── Appointment Box ── */
  .appt-box {
    background: var(--color-input-bg);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 25px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .appt-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
  }
  .appt-row svg {
    color: var(--color-active);
  }

  .cap-bar {
    height: 8px;
    background: #eee;
    border-radius: 10px;
    overflow: hidden;
  }

  .cap-fill {
    height: 100%;
    background: var(--color-active);
    transition: width 0.3s ease;
  }

  /* ── Content & Meta ── */
  .detail-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text);
    margin-bottom: 30px;
    white-space: pre-wrap;
  }

  .detail-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
  }

  .detail-author {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-deactive);
  }

  .detail-time {
    font-size: 13px;
    color: #aaa;
  }

  /* ── Action Buttons ── */
  .action-row {
    display: flex;
    gap: 15px;
  }

  .action-btn-lg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border: 1.5px solid var(--color-border);
    border-radius: 14px;
    background: white;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    color: var(--color-text);
    transition: all 0.15s;
  }
  .action-btn-lg:hover {
    border-color: #aaa;
  }
  .action-btn-lg.liked {
    border-color: #ff4757;
    color: #ff4757;
    background: #fff1f2;
  }
  .action-btn-lg.joined {
    background: var(--color-active);
    border-color: var(--color-active);
    color: white;
  }
  .action-btn-lg:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Comment Section ── */
  .comment-section {
    background: var(--color-sidebar);
    border-radius: 20px;
    border: 1.5px solid var(--color-border);
    padding: 30px;
    margin-top: 20px;
  }

  .comment-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
  }

  .comment-title-label {
    font-size: 18px;
    font-weight: 800;
  }

  .comment-count-badge {
    background: var(--color-active);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 20px;
  }

  .comment-list {
    display: flex;
    flex-direction: column;
  }

  .no-comment {
    font-size: 13px;
    color: #aaa;
    text-align: center;
    padding: 24px 0;
  }

  /* ── Comment Item ── */
  .comment-item-wrap {
    margin-bottom: 20px;
  }
  .comment-item-wrap:last-child {
    margin-bottom: 0;
  }

  .comment-bubble {
    background: var(--color-input-bg);
    padding: 15px 20px;
    border-radius: 0 16px 16px 16px;
    position: relative;
  }

  .comment-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .comment-author {
    font-weight: 800;
    font-size: 14px;
  }
  .comment-time {
    font-size: 12px;
    color: #aaa;
  }

  .comment-text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .comment-actions {
    display: flex;
    gap: 10px;
  }

  .cmt-act-btn {
    background: none;
    border: none;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-deactive);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .cmt-act-btn:hover {
    color: var(--color-active);
  }
  .cmt-act-btn.danger:hover {
    color: #ff4757;
  }

  /* ── Replies ── */
  .replies-wrap {
    margin-left: 20px;
    margin-top: 10px;
  }

  .reply-item-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    border-top: 1px dashed var(--color-border);
    padding-top: 10px;
  }

  .reply-arrow {
    color: #ccc;
  }

  .reply-input-wrap {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    margin-left: 20px;
    border-top: 1px dashed var(--color-border);
    padding-top: 15px;
  }

  /* ── Comment Input ── */
  .comment-input-row {
    display: flex;
    gap: 10px;
    margin-top: 30px;
  }

  .comment-input {
    flex: 1;
    height: 45px;
    padding: 0 15px;
    border-radius: 12px;
    border: 1.5px solid var(--color-border);
    background: var(--color-input-bg);
    outline: none;
  }
  .comment-input:focus {
    border-color: var(--color-active);
  }

  .comment-submit {
    padding: 0 20px;
    background: var(--color-active);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 800;
    cursor: pointer;
  }
  .comment-submit:hover {
    opacity: 0.9;
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.15s ease;
  }

  .modal {
    background: white;
    border-radius: 20px;
    padding: 30px;
    width: 500px;
    max-width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: ${modalIn} 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 5px;
  }

  .modal-btns {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .modal-btn {
    flex: 1;
    height: 45px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-weight: 700;
  }
  .modal-btn.cancel {
    background: #eee;
  }
  .modal-btn.save {
    background: var(--color-active);
    color: white;
    font-weight: 800;
  }

  /* ── Form ── */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text);
    opacity: 0.8;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    font-size: 14px;
    background: var(--color-input-bg);
    outline: none;
  }
  .form-input:focus {
    border-color: var(--color-active);
  }

  .form-textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    font-size: 14px;
    background: var(--color-input-bg);
    min-height: 100px;
    outline: none;
    resize: vertical;
  }
  .form-textarea:focus {
    border-color: var(--color-active);
  }

  /* ── Capacity ── */
  .capacity-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .cap-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1.5px solid var(--color-border);
    background: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cap-btn:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  /* ── Status Select ── */
  .status-select-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .status-select-btn {
    padding: 7px 14px;
    border: 1.5px solid var(--color-border);
    border-radius: 20px;
    background: var(--color-sidebar);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    color: var(--color-text);
    transition: all 0.15s;
  }
  .status-select-btn:hover {
    border-color: #aaa;
  }
  .status-select-btn.active {
    background: var(--color-active);
    color: white;
    border-color: var(--color-active);
  }
`;

// ── Sub Components ────────────────────────────────────────
function CommentEditModal({ text, onSave, onClose }) {
  const [val, setVal] = useState(text);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">댓글 수정</div>
        <textarea
          className="form-textarea"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
        />
        <div className="modal-btns">
          <button className="modal-btn cancel" onClick={onClose}>
            취소
          </button>
          <button
            className="modal-btn save"
            onClick={() => {
              if (!val.trim()) return;
              onSave(val.trim());
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function PostEditModal({ post, onSave, onClose }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [date, setDate] = useState(post.date || "");
  const [time, setTime] = useState(post.time || "");
  const [place, setPlace] = useState(post.place || "");
  const [capacity, setCapacity] = useState(post.capacity || 4);
  const [status, setStatus] = useState(post.status || "모집중");
  const [categories, setCategories] = useState({ ...(post.categories || {}) });
  const [image, setImage] = useState(post.image || "");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }
    onSave({
      title: title.trim(),
      content: content.trim(),
      date,
      time,
      place: place.trim(),
      capacity,
      status,
      categories: { ...categories },
      image,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">게시글 수정</div>

        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}
        >
          <div className="form-group">
            <label className="form-label">📅 날짜</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">⏰ 시간</label>
            <input
              className="form-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📍 장소</label>
          <input
            className="form-input"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">👥 모집 인원</label>
          <div className="capacity-row">
            <button
              className="cap-btn"
              onClick={() => setCapacity((c) => Math.max(1, c - 1))}
            >
              −
            </button>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                minWidth: 40,
                textAlign: "center",
              }}
            >
              {capacity}명
            </span>
            <button
              className="cap-btn"
              onClick={() => setCapacity((c) => Math.min(99, c + 1))}
            >
              ＋
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">상태</label>
          <div className="status-select-row">
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                className={`status-select-btn ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {STATUS_EMOJI[s]} {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">카테고리</label>
          <CategorySelector selected={categories} onChange={setCategories} />
        </div>

        <div className="form-group">
          <label className="form-label">이미지</label>
          <ImageDropZone value={image} onChange={setImage} small />
        </div>

        <div className="modal-btns">
          <button className="modal-btn cancel" onClick={onClose}>
            취소
          </button>
          <button className="modal-btn save" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply, onEdit, onDelete }) {
  return (
    <div className="reply-item-row">
      <div className="reply-arrow">
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
      </div>
      <div className="comment-bubble" style={{ flex: 1 }}>
        <div className="comment-top">
          <span className="comment-author">{reply.author || "익명"}</span>
          {reply.edited && <span className="edited-badge sm">수정됨</span>}
          <span className="comment-time">{getTimeAgo(reply.createdAt)}</span>
        </div>
        <div className="comment-text">{reply.text}</div>
        <div className="comment-actions">
          <button className="cmt-act-btn" onClick={onEdit}>
            수정
          </button>
          <button className="cmt-act-btn danger" onClick={onDelete}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, commentIdx, onUpdate, onDelete }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editTarget, setEditTarget] = useState(null);

  const submitReply = () => {
    if (!replyText.trim()) return;
    onUpdate(commentIdx, replyText.trim());
    setReplyText("");
    setReplyOpen(false);
  };

  const handleSaveEdit = (newText) => {
    if (editTarget.type === "comment") {
      onUpdate(commentIdx, null, newText);
    } else {
      onUpdate(commentIdx, null, null, editTarget.ri, newText);
    }
    setEditTarget(null);
  };

  return (
    <div className="comment-item-wrap">
      <div className="comment-bubble">
        <div className="comment-top">
          <span className="comment-author">{comment.author || "익명"}</span>
          {comment.edited && <span className="edited-badge sm">수정됨</span>}
          <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
        </div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-actions">
          <button
            className="cmt-act-btn"
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
          <button
            className="cmt-act-btn"
            onClick={() => setEditTarget({ type: "comment" })}
          >
            수정
          </button>
          <button
            className="cmt-act-btn danger"
            onClick={() => onDelete(commentIdx)}
          >
            삭제
          </button>
        </div>
      </div>

      {(comment.replies || []).length > 0 && (
        <div className="replies-wrap">
          {comment.replies.map((r, ri) => (
            <ReplyItem
              key={ri}
              reply={r}
              onEdit={() => setEditTarget({ type: "reply", ri })}
              onDelete={() => onDelete(commentIdx, ri)}
            />
          ))}
        </div>
      )}

      {replyOpen && (
        <div className="reply-input-wrap">
          <div className="reply-arrow">
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
          </div>
          <div style={{ display: "flex", gap: 10, flex: 1 }}>
            <input
              className="comment-input"
              placeholder="답글 입력..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              autoFocus
            />
            <button className="comment-submit" onClick={submitReply}>
              등록
            </button>
          </div>
        </div>
      )}

      {editTarget && (
        <CommentEditModal
          text={
            editTarget.type === "comment"
              ? comment.text
              : (comment.replies || [])[editTarget.ri]?.text
          }
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { name } = useAuth();
  const [post, setPost] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const load = async () => {
    try {
      const data = await getPost(id);
      setPost(data);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!post) {
    return (
      <DetailStyles>
        <main className="container">
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            게시글을 찾을 수 없어요
          </div>
        </main>
      </DetailStyles>
    );
  }

  const userId = name || "me";
  const liked = (post.likedBy || []).includes(userId);
  const joined = (post.joinedBy || []).includes(userId);
  const isFull = (post.participants || 0) >= (post.capacity || 4);
  const pct = Math.min(
    100,
    ((post.participants || 0) / (post.capacity || 4)) * 100,
  );
  const tags = Object.entries(post.categories || {}).filter(([, v]) => v);
  const statusCls = STATUS_CLASS[post.status] || "status-open";
  const dateStr = formatDateTime(post.date, post.time);
  const totalComments = countComments(post.comments || []);

  const sync = async (updates) => {
    const next = { ...post, ...updates };
    try {
      await updatePost(id, next);
      setPost(next);
    } catch (err) {
      console.error("Failed to sync post:", err);
      alert("서버 저장 실패");
    }
  };

  const toggleLike = () => {
    const list = [...(post.likedBy || [])];
    const i = list.indexOf(userId);
    let count = post.likes || 0;
    if (i === -1) {
      list.push(userId);
      count++;
    } else {
      list.splice(i, 1);
      count = Math.max(0, count - 1);
    }
    sync({ likedBy: list, likes: count });
  };

  const toggleJoin = () => {
    // 작성자는 참여를 취소할 수 없음
    if (post.author === userId) {
      alert("게시글 작성자는 참여를 취소할 수 없습니다.");
      return;
    }

    const list = [...(post.joinedBy || [])];
    const i = list.indexOf(userId);
    let count = post.participants || 0;
    if (i === -1) {
      if (count >= (post.capacity || 4)) return alert("정원 초과!");
      list.push(userId);
      count++;
    } else {
      list.splice(i, 1);
      count = Math.max(0, count - 1);
    }
    sync({ joinedBy: list, participants: count });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newList = [
      ...(post.comments || []),
      {
        text: commentText.trim(),
        author: userId,
        createdAt: Date.now(),
        replies: [],
        edited: false,
      },
    ];
    sync({ comments: newList });
    setCommentText("");
  };

  const deleteComment = (idx, replyIdx = null) => {
    if (!window.confirm("삭제할까요?")) return;
    const newList = [...(post.comments || [])];
    if (replyIdx !== null) {
      newList[idx].replies.splice(replyIdx, 1);
    } else {
      newList.splice(idx, 1);
    }
    sync({ comments: newList });
  };

  const updateComment = (
    idx,
    replyText,
    editText,
    replyIdx = null,
    replyEditText = null,
  ) => {
    const newList = [...(post.comments || [])];
    if (editText) {
      newList[idx].text = editText;
      newList[idx].edited = true;
    }
    if (replyText) {
      newList[idx].replies = newList[idx].replies || [];
      newList[idx].replies.push({
        text: replyText,
        author: userId,
        createdAt: Date.now(),
        edited: false,
      });
    }
    if (replyEditText !== null && replyIdx !== null) {
      newList[idx].replies[replyIdx].text = replyEditText;
      newList[idx].replies[replyIdx].edited = true;
    }
    sync({ comments: newList });
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await deletePost(id);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  const isAuthor = post.author === userId;

  return (
    <DetailStyles>
      <main className="container">
        <div className="top-nav">
          <button className="back-btn" onClick={() => navigate("/")}>
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
          <div className="more-menu-wrap">
            <button
              className="more-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {showMoreMenu && (
              <div className="more-menu">
                <div
                  className="more-item"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMoreMenu(false);
                  }}
                >
                  수정
                </div>
                <div className="more-item delete" onClick={handleDelete}>
                  삭제
                </div>
              </div>
            )}
          </div>
        </div>

        {post.image && <img className="detail-img" src={post.image} alt="" />}

        <div className="detail-body">
          <div className="status-row">
            <span className={`status-badge ${statusCls}`}>
              {STATUS_EMOJI[post.status]} {post.status}
            </span>
            {post.edited && <span className="edited-badge">수정됨</span>}
          </div>

          {tags.length > 0 && (
            <div className="tags-row">
              {tags.map(([, v]) => (
                <span key={v} className="tag">
                  {v}
                </span>
              ))}
            </div>
          )}

          <h2 className="detail-title">{post.title}</h2>

          <div className="appt-box">
            {dateStr && (
              <div className="appt-row">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{dateStr}</span>
              </div>
            )}
            {post.place && (
              <div className="appt-row">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{post.place}</span>
              </div>
            )}
            <div className="appt-row">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>
                {post.participants || 0} / {post.capacity || 4}명 참여중
              </span>
            </div>
            <div className="cap-bar">
              <div className="cap-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <p className="detail-content">{post.content}</p>

          <div className="detail-meta-row">
            <span className="detail-author">
              작성자: {post.author || "익명"}
            </span>
            <span className="detail-time">
              {new Date(post.createdAt).toLocaleString("ko-KR")}
            </span>
          </div>

          <div className="action-row">
            <button
              className={`action-btn-lg ${liked ? "liked" : ""}`}
              onClick={toggleLike}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={liked ? "#ff4757" : "none"}
                stroke={liked ? "#ff4757" : "currentColor"}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              좋아요 {post.likes || 0}
            </button>
            <button
              className={`action-btn-lg ${joined ? "joined" : ""}`}
              onClick={toggleJoin}
              disabled={(isFull && !joined) || isAuthor}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {isAuthor ? "방장(참여중)" : joined ? "참여중" : isFull ? "인원 마감" : "참여하기"}
            </button>
          </div>
        </div>

        <div className="comment-section">
          <div className="comment-title-row">
            <span className="comment-title-label">댓글</span>
            <span className="comment-count-badge">{totalComments}</span>
          </div>
          <div className="comment-list">
            {totalComments === 0 ? (
              <div className="no-comment">첫 댓글을 남겨보세요 👋</div>
            ) : (
              post.comments?.map((c, i) => (
                <CommentItem
                  key={i}
                  comment={c}
                  commentIdx={i}
                  onDelete={deleteComment}
                  onUpdate={updateComment}
                />
              ))
            )}
          </div>
          <div className="comment-input-row">
            <input
              className="comment-input"
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
            />
            <button className="comment-submit" onClick={addComment}>
              등록
            </button>
          </div>
        </div>

        {showEditModal && (
          <PostEditModal
            post={post}
            onSave={(fields) =>
              sync({ ...fields, edited: true }).then(() =>
                setShowEditModal(false),
              )
            }
            onClose={() => setShowEditModal(false)}
          />
        )}
      </main>
    </DetailStyles>
  );
}
