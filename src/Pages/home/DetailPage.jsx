import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTimeAgo, countComments, formatDateTime, 
  STATUS_LIST, STATUS_EMOJI, STATUS_CLASS, getNickname
} from "./constants";
import { getPost, deletePost, updatePost } from "../../api/post";
import CategorySelector from "./components/CategorySelector";
import ImageDropZone from "./components/ImageDropZone";
import "./App.css";

// ── 댓글 수정 모달 ──────────────────────────────────────
function CommentEditModal({ text, onSave, onClose }) {
  const [val, setVal] = useState(text);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">댓글 수정</div>
        <textarea
          className="form-textarea"
          style={{ minHeight: 80 }}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
        />
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onClose}>취소</button>
          <button className="modal-save" onClick={() => { if (!val.trim()) return; onSave(val.trim()); }}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 게시글 수정 모달 ─────────────────────────────────────
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
    if (!title.trim() || !content.trim()) { alert("제목과 내용을 입력해주세요!"); return; }
    onSave({ title: title.trim(), content: content.trim(), date, time, place: place.trim(), capacity, status, categories: { ...categories }, image });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">게시글 수정</div>

        <div className="form-group">
          <label className="form-label">제목</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea className="form-textarea" style={{ minHeight: 100 }} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">📅 날짜</label>
            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">⏰ 시간</label>
            <input className="form-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📍 장소</label>
          <input className="form-input" value={place} onChange={(e) => setPlace(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">👥 모집 인원</label>
          <div className="capacity-row">
            <button className="cap-btn" onClick={() => setCapacity((c) => Math.max(1, c - 1))}>−</button>
            <span className="cap-display">{capacity}명</span>
            <button className="cap-btn" onClick={() => setCapacity((c) => Math.min(99, c + 1))}>＋</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">상태</label>
          <div className="status-select-row">
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                className={`status-select-btn${status === s ? " active" : ""}`}
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
          <button className="modal-cancel" onClick={onClose}>취소</button>
          <button className="modal-save" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 대댓글 아이템 ────────────────────────────────────────
function ReplyItem({ reply, onEdit, onDelete }) {
  return (
    <div className="comment-item reply-item">
      <div className="reply-arrow">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
        </svg>
      </div>
      <div className="comment-bubble">
        <div className="comment-top">
          <span className="comment-author">{reply.author || "익명"}</span>
          {reply.edited && <span className="edited-badge sm">수정됨</span>}
          <span className="comment-time">{getTimeAgo(reply.createdAt)}</span>
        </div>
        <div className="comment-text">{reply.text}</div>
        <div className="comment-actions">
          <button className="cmt-act-btn" onClick={onEdit}>수정</button>
          <button className="cmt-act-btn danger" onClick={onDelete}>삭제</button>
        </div>
      </div>
    </div>
  );
}

// ── 댓글 아이템 ─────────────────────────────────────────
function CommentItem({ comment, commentIdx, onUpdate, onDelete }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editTarget, setEditTarget] = useState(null); // null | { type: 'comment' } | { type: 'reply', ri }

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
    <div className="comment-item">
      <div className="comment-bubble">
        <div className="comment-top">
          <span className="comment-author">{comment.author || "익명"}</span>
          {comment.edited && <span className="edited-badge sm">수정됨</span>}
          <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
        </div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-actions">
          <button className="cmt-act-btn reply-toggle-btn" onClick={() => setReplyOpen(!replyOpen)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
            답글
          </button>
          <button className="cmt-act-btn" onClick={() => setEditTarget({ type: "comment" })}>수정</button>
          <button className="cmt-act-btn danger" onClick={() => onDelete(commentIdx)}>삭제</button>
        </div>
      </div>

      {/* 대댓글 목록 */}
      {(comment.replies || []).length > 0 && (
        <div className="replies-wrap">
          {(comment.replies || []).map((r, ri) => (
            <ReplyItem
              key={ri}
              reply={r}
              onEdit={() => setEditTarget({ type: "reply", ri })}
              onDelete={() => onDelete(commentIdx, ri)}
            />
          ))}
        </div>
      )}

      {/* 답글 입력창 */}
      {replyOpen && (
        <div className="reply-input-wrap">
          <div className="reply-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
          </div>
          <div className="reply-input-inner">
            <input
              className="comment-input reply-input"
              placeholder="답글 입력..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              autoFocus
            />
            <button className="comment-submit reply-submit" onClick={submitReply}>등록</button>
          </div>
        </div>
      )}

      {/* 댓글/답글 수정 모달 */}
      {editTarget && (
        <CommentEditModal
          text={editTarget.type === "comment" ? comment.text : (comment.replies || [])[editTarget.ri]?.text}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

// ── 메인 상세 페이지 ─────────────────────────────────────
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <main className="container">
        <div className="empty-state"><p>게시글을 찾을 수 없어요</p></div>
      </main>
    );
  }

  const liked = (post.likedBy || []).includes("me");
  const joined = (post.joinedBy || []).includes("me");
  const isFull = (post.participants || 0) >= (post.capacity || 4);
  const pct = Math.min(100, ((post.participants || 0) / (post.capacity || 4)) * 100);
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
    const i = list.indexOf("me");
    let count = post.likes || 0;
    if (i === -1) {
      list.push("me");
      count++;
    } else {
      list.splice(i, 1);
      count = Math.max(0, count - 1);
    }
    sync({ likedBy: list, likes: count });
  };

  const toggleJoin = () => {
    const list = [...(post.joinedBy || [])];
    const i = list.indexOf("me");
    let count = post.participants || 0;
    if (i === -1) {
      if (count >= (post.capacity || 4)) return alert("정원 초과!");
      list.push("me");
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
      { text: commentText.trim(), author: getNickname(), createdAt: Date.now(), replies: [], edited: false }
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

  const updateComment = (idx, replyText, editText, replyIdx = null, replyEditText = null) => {
    const newList = [...(post.comments || [])];
    if (editText) {
      newList[idx].text = editText;
      newList[idx].edited = true;
    }
    if (replyText) {
      newList[idx].replies = newList[idx].replies || [];
      newList[idx].replies.push({ text: replyText, author: getNickname(), createdAt: Date.now(), edited: false });
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

  return (
    <main className="container">
      {/* 뒤로가기 및 더보기 메뉴 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <button className="back-btn" onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="more-menu-wrap">
          <button className="more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {showMoreMenu && (
            <div className="more-menu">
              <div className="more-item" onClick={() => { setShowEditModal(true); setShowMoreMenu(false); }}>수정</div>
              <div className="more-item delete" onClick={handleDelete}>삭제</div>
            </div>
          )}
        </div>
      </div>

      {post.image && <img src={post.image} className="detail-img" alt="" />}
      <div className="detail-body">
        <div className="detail-status-row">
          <span className={`status-badge ${statusCls} lg`}>{STATUS_EMOJI[post.status]} {post.status}</span>
          {post.edited && <span className="edited-badge">수정됨</span>}
        </div>

        {tags.length > 0 && (
          <div className="card-tags" style={{ marginBottom: 12 }}>
            {tags.map(([, v]) => <span className="tag" key={v}>{v}</span>)}
          </div>
        )}

        <h2 className="detail-title">{post.title}</h2>

        <div className="appt-box">
          {dateStr && (
            <div className="appt-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{dateStr}</span>
            </div>
          )}
          {post.place && (
            <div className="appt-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{post.place}</span>
            </div>
          )}
          <div className="appt-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{post.participants || 0} / {post.capacity || 4}명 참여중</span>
          </div>
          <div className="cap-bar detail-cap-bar"><div className="cap-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        <p className="detail-content">{post.content}</p>

        <div className="detail-meta-row">
          <span className="detail-author">작성자: {post.author || "익명"}</span>
          <span className="detail-time">{new Date(post.createdAt).toLocaleString("ko-KR")}</span>
        </div>

        <div className="detail-actions">
          <button className={`action-btn-lg${liked ? " liked" : ""}`} onClick={toggleLike}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#ff4757" : "none"} stroke={liked ? "#ff4757" : "currentColor"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            좋아요 {post.likes || 0}
          </button>
          <button
            className={`action-btn-lg${joined ? " joined" : ""}${isFull && !joined ? " disabled-btn" : ""}`}
            onClick={toggleJoin}
            disabled={isFull && !joined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {joined ? "참여중" : isFull ? "인원 마감" : "참여하기"}
          </button>
        </div>
      </div>

      <div className="comment-section">
        <div className="comment-title-row">
          <span className="comment-title">댓글</span>
          <span className="comment-count-badge">{totalComments}</span>
        </div>
        <div className="comment-list">
          {(post.comments || []).length === 0 ? (
            <div className="no-comment">첫 댓글을 남겨보세요 👋</div>
          ) : (
            (post.comments || []).map((c, i) => (
              <CommentItem key={i} comment={c} commentIdx={i} onDelete={deleteComment} onUpdate={updateComment} />
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
          <button className="comment-submit" onClick={addComment}>등록</button>
        </div>
      </div>

      {showEditModal && (
        <PostEditModal 
          post={post} 
          onSave={(fields) => sync({ ...fields, edited: true }).then(() => setShowEditModal(false))} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </main>
  );
}
