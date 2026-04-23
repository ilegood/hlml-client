import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTimeAgo, countComments, formatDateTime, 
  STATUS_LIST, STATUS_EMOJI, STATUS_CLASS, getNickname,
  MIN_CAPACITY, MAX_CAPACITY
} from "./constants";
import { getPost, deletePost, updatePost } from "../../api/post";
import CategorySelector from "./components/CategorySelector";
import ImageDropZone from "./components/ImageDropZone";
import "./App.css";

const CapacityInput = ({ value, onChange }) => (
  <div className="capacity-row">
    <button className="cap-btn" onClick={() => onChange(Math.max(MIN_CAPACITY, value - 1))}>−</button>
    <span className="cap-display">{value}명</span>
    <button className="cap-btn" onClick={() => onChange(Math.min(MAX_CAPACITY, value + 1))}>＋</button>
  </div>
);

const Modal = ({ title, children, onSave, onClose, sm }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal ${sm ? "modal-sm" : ""}`} onClick={e => e.stopPropagation()}>
      <div className="modal-title">{title}</div>
      {children}
      <div className="modal-btns">
        <button className="modal-cancel" onClick={onClose}>취소</button>
        <button className="modal-save" onClick={onSave}>저장</button>
      </div>
    </div>
  </div>
);

const CommentItem = ({ c, onAction, depth = 0 }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="comment-item">
      <div className="comment-bubble">
        <div className="comment-top">{c.author} {c.edited && <span className="edited-badge sm">수정됨</span>} <span className="comment-time">{getTimeAgo(c.createdAt)}</span></div>
        <div className="comment-text">{c.text}</div>
        <div className="comment-actions">
          {depth < 2 && <button className="cmt-act-btn" onClick={() => setReplyOpen(!replyOpen)}>답글</button>}
          <button className="cmt-act-btn" onClick={() => onAction('edit', c)}>수정</button>
          <button className="cmt-act-btn danger" onClick={() => onAction('delete', c)}>삭제</button>
        </div>
      </div>
      {replyOpen && (
        <div className="reply-input-wrap" style={{ marginLeft: 20, marginTop: 10, display: "flex", gap: 8 }}>
          <input className="comment-input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="답글 입력..." style={{ flex: 1 }} />
          <button className="comment-submit" onClick={() => { if(replyText.trim()){ onAction('reply', c, replyText.trim()); setReplyText(""); setReplyOpen(false); } }}>등록</button>
        </div>
      )}
      {c.replies?.length > 0 && (
        <div className="replies-wrap" style={{ marginLeft: 20, borderLeft: "2px solid #eee", paddingLeft: 10 }}>
          {c.replies.map(r => <CommentItem key={r.createdAt} c={r} onAction={onAction} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    try { const data = await getPost(id); setPost(data); } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!post) return <main className="container"><div className="empty-state">로딩 중...</div></main>;

  const sync = async (updates) => {
    try {
      // 최신 상태를 보장하기 위해 post가 아닌 함수형 업데이트 또는 현재 post 객체 사용
      const next = { ...post, ...updates };
      if (updates.likedBy) next.likes = updates.likedBy.length;
      if (updates.joinedBy) next.participants = updates.joinedBy.length;
      
      const res = await updatePost(id, next);
      if (res.success) setPost(next);
      else throw new Error("Update failed");
    } catch (err) {
      console.error(err);
      alert("요청 처리에 실패했습니다.");
      load(); // 실패 시 최신 데이터 다시 불러오기
    }
  };

  const handleAction = (type) => {
    if (type === 'like') {
      const list = post.likedBy || [];
      const newList = list.includes("me") ? list.filter(m => m !== "me") : [...list, "me"];
      sync({ likedBy: newList });
    } else if (type === 'join') {
      if (post.status === "모집완료" && !post.joinedBy?.includes("me")) return alert("모집 완료된 게시글물입니다.");
      const list = post.joinedBy || [];
      const joined = list.includes("me");
      if (!joined && (post.participants || 0) >= (post.capacity || 4)) return alert("정원 초과!");
      const newList = joined ? list.filter(m => m !== "me") : [...list, "me"];
      sync({ joinedBy: newList });
    }
  };

  const updateComments = (action, commentId, data) => {
    const transform = (list) => {
      return list.map(c => {
        if (c.createdAt === commentId) {
          if (action === 'edit') return { ...c, text: data, edited: true };
          if (action === 'reply') return { ...c, replies: [...(c.replies || []), { text: data, author: getNickname(), createdAt: Date.now(), replies: [] }] };
          if (action === 'delete') return null;
        }
        return { ...c, replies: transform(c.replies || []) };
      }).filter(Boolean);
    };

    if (action === 'add') {
      sync({ comments: [...(post.comments || []), { text: data, author: getNickname(), createdAt: Date.now(), replies: [] }] });
    } else {
      sync({ comments: transform(post.comments || []) });
    }
  };

  const isClosed = post.status === "모집완료";
  const joined = post.joinedBy?.includes("me");
  const isFull = (post.participants || 0) >= (post.capacity || 4);
  const pct = Math.min(100, ((post.participants || 0) / (post.capacity || 4)) * 100);
  const tags = Object.entries(post.categories || {}).filter(([, v]) => v);

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <button className="back-btn" onClick={() => navigate("/")}>←</button>
        <div className="more-menu-wrap">
          <button className="more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}>⋮</button>
          {showMoreMenu && (
            <div className="more-menu">
              <div className="more-item" onClick={() => { setShowEditModal(true); setShowMoreMenu(false); }}>수정</div>
              <div className="more-item delete" onClick={async () => { if (confirm("삭제할까요?")) { await deletePost(id); navigate("/"); } }}>삭제</div>
            </div>
          )}
        </div>
      </div>

      {post.image && <img src={post.image} className="detail-img" alt="" />}
      <div className="detail-body">
        <div className="detail-status-row">
          <span className={`status-badge ${STATUS_CLASS[post.status]} lg`}>{STATUS_EMOJI[post.status]} {post.status}</span>
          {post.edited && <span className="edited-badge">수정됨</span>}
        </div>
        {tags.length > 0 && <div className="card-tags">{tags.map(([, v]) => <span className="tag" key={v}>{v}</span>)}</div>}
        <h2 className="detail-title">{post.title}</h2>
        <div className="appt-box">
          <div className="appt-row">📅 {formatDateTime(post.date, post.time)}</div>
          {post.place && <div className="appt-row">📍 {post.place}</div>}
          <div className="appt-row">👥 {post.participants || 0} / {post.capacity || 4}명 참여중</div>
          <div className="cap-bar detail-cap-bar"><div className="cap-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <p className="detail-content">{post.content}</p>
        <div className="detail-actions">
          <button className={`action-btn-lg ${post.likedBy?.includes("me") ? "liked" : ""}`} onClick={() => handleAction('like')}>♥ 좋아요 {post.likes || 0}</button>
          <button 
            className={`action-btn-lg ${joined ? "joined" : ""} ${(isClosed || (isFull && !joined)) && !joined ? "disabled-btn" : ""}`} 
            onClick={() => handleAction('join')}
            disabled={isClosed && !joined}
          >
            {joined ? "참여중" : isClosed ? "모집 완료" : isFull ? "인원 마감" : "참여하기"}
          </button>
        </div>
      </div>

      <div className="comment-section">
        <div className="comment-title-row">댓글 <span className="comment-count-badge">{countComments(post.comments)}</span></div>
        <div className="comment-list">
          {(post.comments || []).map(c => (
            <CommentItem 
              key={c.createdAt} 
              c={c} 
              onAction={(action, comment, text) => {
                if (action === 'delete') { if (confirm("삭제할까요?")) updateComments('delete', comment.createdAt); }
                else if (action === 'reply') { if (text) updateComments('reply', comment.createdAt, text); }
                else if (action === 'edit') { setEditTarget({ type: 'comment', id: comment.createdAt, text: comment.text }); }
              }} 
            />
          ))}
        </div>
        <div className="comment-input-row">
          <input className="comment-input" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="댓글 입력..." />
          <button className="comment-submit" onClick={() => { if (commentText.trim()) { updateComments('add', null, commentText.trim()); setCommentText(""); } }}>등록</button>
        </div>
      </div>

      {showEditModal && (
        <PostEditModal post={post} onSave={f => sync({ ...f, edited: true }).then(() => setShowEditModal(false))} onClose={() => setShowEditModal(false)} />
      )}
      {editTarget && (
        <Modal title="댓글 수정" sm onSave={() => { updateComments('edit', editTarget.id, editTarget.text); setEditTarget(null); }} onClose={() => setEditTarget(null)}>
          <textarea className="form-textarea" value={editTarget.text} onChange={e => setEditTarget({ ...editTarget, text: e.target.value })} />
        </Modal>
      )}
    </main>
  );
}

function PostEditModal({ post, onSave, onClose }) {
  const [form, setForm] = useState({ ...post });
  return (
    <Modal title="게시글 수정" onSave={() => onSave(form)} onClose={onClose}>
      <div className="form-group"><label className="form-label">제목</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">내용</label><textarea className="form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
      <div className="form-row-2">
        <div className="form-group"><label className="form-label">날짜</label><input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">시간</label><input className="form-input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
      </div>
      <div className="form-group"><label className="form-label">모집 인원</label><CapacityInput value={form.capacity} onChange={v => setForm({ ...form, capacity: v })} /></div>
      <div className="form-group">
        <label className="form-label">상태</label>
        <div className="status-select-row">{STATUS_LIST.map(s => <button key={s} className={`status-select-btn ${form.status === s ? "active" : ""}`} onClick={() => setForm({ ...form, status: s })}>{STATUS_EMOJI[s]} {s}</button>)}</div>
      </div>
      <div className="form-group"><label className="form-label">카테고리</label><CategorySelector selected={form.categories} onChange={c => setForm({ ...form, categories: c })} /></div>
      <div className="form-group"><label className="form-label">이미지</label><ImageDropZone value={form.image} onChange={i => setForm({ ...form, image: i })} small /></div>
    </Modal>
  );
}
