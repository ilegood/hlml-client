import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getTimeAgo, countComments, formatDateTime, 
  STATUS_LIST, STATUS_EMOJI, STATUS_CLASS
} from "./homeConstants";
import { getPost, deletePost, updatePost } from "../api/posts";
import CategorySelector from "../components/home/CategorySelector";
import ImageDropZone from "../components/home/ImageDropZone";

// ── Styled Components ─────────────────────────────────────
const Container = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const TopNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-sidebar);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }
`;

const MoreMenuWrap = styled.div`
  position: relative;
`;

const MoreMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 120px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
`;

const MoreItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #f8f9fa; }
  &.delete { color: #ff4757; }
`;

const DetailImg = styled.img`
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const DetailBody = styled.div`
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;

  &.status-open { background: #e1f5fe; color: #0288d1; }
  &.status-full { background: #ffebee; color: #d32f2f; }
`;

const EditedBadge = styled.span`
  font-size: 12px;
  color: #aaa;
  font-weight: 600;
`;

const DetailTitle = styled.h2`
  font-size: 32px;
  font-weight: 900;
  color: var(--color-text);
  margin-bottom: 25px;
`;

const ApptBox = styled.div`
  background: var(--color-input-bg);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const ApptRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);

  svg { color: var(--color-active); }
`;

const CapBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 5px;
`;

const CapFill = styled.div`
  height: 100%;
  background: var(--color-active);
  transition: width 0.3s ease;
`;

const DetailContent = styled.p`
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: 40px;
  white-space: pre-wrap;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 25px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-deactive);
`;

const ActionRow = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 40px;
`;

const ActionBtnLg = styled.button`
  flex: 1;
  height: 56px;
  border-radius: 14px;
  border: 2px solid var(--color-border);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;

  &.liked { border-color: #ff4757; color: #ff4757; }
  &.joined { background: var(--color-active); border-color: var(--color-active); color: white; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CommentSection = styled.div`
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 40px;
`;

const CommentTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 800;
`;

const CommentCountBadge = styled.span`
  background: var(--color-active);
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 14px;
`;

const CommentInputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
`;

const CommentInput = styled.input`
  flex: 1;
  height: 48px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  background: var(--color-input-bg);
  font-size: 15px;
  outline: none;

  &:focus { border-color: var(--color-active); }
`;

const CommentSubmit = styled.button`
  padding: 0 25px;
  background: var(--color-active);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
`;

const CommentItemWrap = styled.div`
  margin-bottom: 25px;
  &:last-child { margin-bottom: 0; }
`;

const CommentBubble = styled.div`
  background: #f8f9fa;
  padding: 16px 20px;
  border-radius: 0 16px 16px 16px;
  position: relative;
`;

const CommentTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const Author = styled.span` font-weight: 800; font-size: 14px; `;
const Time = styled.span` font-size: 11px; color: #aaa; `;
const CommentText = styled.div` font-size: 15px; line-height: 1.5; color: var(--color-text); `;

const CommentActions = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
  button {
    background: none;
    border: none;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-deactive);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    &:hover { color: var(--color-active); }
    &.danger:hover { color: #ff4757; }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: white;
  width: 500px;
  padding: 30px;
  border-radius: 20px;
  &.sm { width: 400px; }
`;

// ── Components ────────────────────────────────────────────
function CommentEditModal({ text, onSave, onClose }) {
  const [val, setVal] = useState(text);
  return (
    <ModalOverlay onClick={onClose}>
      <Modal className="sm" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 15 }}>댓글 수정</h3>
        <textarea
          style={{ width: "100%", height: 100, padding: 10, borderRadius: 10, border: "1.5px solid #eee", outline: "none" }}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{ flex: 1, height: 40, borderRadius: 10, border: "none", background: "#eee", cursor: "pointer" }} onClick={onClose}>취소</button>
          <button style={{ flex: 1, height: 40, borderRadius: 10, border: "none", background: "var(--color-active)", color: "white", fontWeight: 800, cursor: "pointer" }} onClick={() => { if (!val.trim()) return; onSave(val.trim()); }}>저장</button>
        </div>
      </Modal>
    </ModalOverlay>
  );
}

function PostEditModal({ post, onSave, onClose }) {
  const [fields, setFields] = useState({ ...post });

  const handleSave = () => {
    if (!fields.title.trim() || !fields.content.trim()) return alert("제목과 내용을 입력해주세요!");
    onSave(fields);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()} style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ marginBottom: 20 }}>게시글 수정</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>제목</label>
            <input style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1.5px solid #eee" }} value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>내용</label>
            <textarea style={{ width: "100%", height: 100, padding: 10, borderRadius: 8, border: "1.5px solid #eee", resize: "none" }} value={fields.content} onChange={(e) => setFields({ ...fields, content: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>날짜</label>
              <input type="date" style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1.5px solid #eee" }} value={fields.date} onChange={(e) => setFields({ ...fields, date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>시간</label>
              <input type="time" style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1.5px solid #eee" }} value={fields.time} onChange={(e) => setFields({ ...fields, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>장소</label>
            <input style={{ width: "100%", height: 40, padding: "0 10px", borderRadius: 8, border: "1.5px solid #eee" }} value={fields.place} onChange={(e) => setFields({ ...fields, place: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>이미지</label>
            <ImageDropZone value={fields.image} onChange={(img) => setFields({ ...fields, image: img })} small />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          <button style={{ flex: 1, height: 45, borderRadius: 10, border: "none", background: "#eee", cursor: "pointer" }} onClick={onClose}>취소</button>
          <button style={{ flex: 1, height: 45, borderRadius: 10, border: "none", background: "var(--color-active)", color: "white", fontWeight: 800, cursor: "pointer" }} onClick={handleSave}>저장</button>
        </div>
      </Modal>
    </ModalOverlay>
  );
}

function CommentItem({ comment, commentIdx, onUpdate, onDelete }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editTarget, setEditTarget] = useState(null);

  return (
    <CommentItemWrap>
      <CommentBubble>
        <CommentTop>
          <Author>{comment.author}</Author>
          {comment.edited && <EditedBadge>수정됨</EditedBadge>}
          <Time>{getTimeAgo(comment.createdAt)}</Time>
        </CommentTop>
        <CommentText>{comment.text}</CommentText>
        <CommentActions>
          <button onClick={() => setReplyOpen(!replyOpen)}>답글</button>
          <button onClick={() => setEditTarget({ type: "comment" })}>수정</button>
          <button className="danger" onClick={() => onDelete(commentIdx)}>삭제</button>
        </CommentActions>
      </CommentBubble>

      {/* 대댓글 등 로직 생략(UI 정리 위주) */}
      {editTarget && (
        <CommentEditModal
          text={comment.text}
          onSave={(t) => { onUpdate(commentIdx, null, t); setEditTarget(null); }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </CommentItemWrap>
  );
}

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
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, [id]);

  if (!post) return <Container><div style={{ textAlign: "center", padding: 100 }}>로딩 중...</div></Container>;

  const liked = (post.likedBy || []).includes("me");
  const joined = (post.joinedBy || []).includes("me");
  const isFull = (post.participants || 0) >= (post.capacity || 4);
  const pct = Math.min(100, ((post.participants || 0) / (post.capacity || 4)) * 100);
  const dateStr = formatDateTime(post.date, post.time);

  const sync = async (updates) => {
    try {
      const next = { ...post, ...updates };
      await updatePost(id, next);
      setPost(next);
    } catch (err) { alert("저장 실패"); }
  };

  const toggleLike = () => {
    const list = [...(post.likedBy || [])];
    const i = list.indexOf("me");
    let count = post.likes || 0;
    if (i === -1) { list.push("me"); count++; } else { list.splice(i, 1); count = Math.max(0, count - 1); }
    sync({ likedBy: list, likes: count });
  };

  const toggleJoin = () => {
    const list = [...(post.joinedBy || [])];
    const i = list.indexOf("me");
    let count = post.participants || 0;
    if (i === -1) {
      if (count >= (post.capacity || 4)) return alert("정원 초과!");
      list.push("me"); count++;
    } else { list.splice(i, 1); count = Math.max(0, count - 1); }
    sync({ joinedBy: list, participants: count });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newList = [...(post.comments || []), { text: commentText.trim(), author: localStorage.getItem("name") || "익명", createdAt: Date.now(), replies: [], edited: false }];
    sync({ comments: newList });
    setCommentText("");
  };

  return (
    <Container>
      <TopNav>
        <IconButton onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </IconButton>
        <MoreMenuWrap>
          <IconButton onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </IconButton>
          {showMoreMenu && (
            <MoreMenu>
              <MoreItem onClick={() => { setShowEditModal(true); setShowMoreMenu(false); }}>수정</MoreItem>
              <MoreItem className="delete" onClick={async () => { if(confirm("삭제할까요?")) { await deletePost(id); navigate("/"); } }}>삭제</MoreItem>
            </MoreMenu>
          )}
        </MoreMenuWrap>
      </TopNav>

      {post.image && <DetailImg src={post.image} />}

      <DetailBody>
        <StatusRow>
          <StatusBadge className={STATUS_CLASS[post.status]}>{STATUS_EMOJI[post.status]} {post.status}</StatusBadge>
          {post.edited && <EditedBadge>수정됨</EditedBadge>}
        </StatusRow>
        <DetailTitle>{post.title}</DetailTitle>
        <ApptBox>
          <ApptRow><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{dateStr}</ApptRow>
          <ApptRow><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{post.place || "장소 미정"}</ApptRow>
          <ApptRow><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>{post.participants} / {post.capacity}명 참여중</ApptRow>
          <CapBar><CapFill style={{ width: `${pct}%` }} /></CapBar>
        </ApptBox>
        <DetailContent>{post.content}</DetailContent>
        <MetaRow>
          <span>작성자: {post.author}</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </MetaRow>
        <ActionRow>
          <ActionBtnLg className={liked ? "liked" : ""} onClick={toggleLike}>좋아요 {post.likes}</ActionBtnLg>
          <ActionBtnLg className={joined ? "joined" : ""} onClick={toggleJoin} disabled={isFull && !joined}>{joined ? "참여 취소" : isFull ? "인원 마감" : "참여하기"}</ActionBtnLg>
        </ActionRow>
      </DetailBody>

      <CommentSection>
        <CommentTitleRow>댓글 <CommentCountBadge>{countComments(post.comments)}</CommentCountBadge></CommentTitleRow>
        {post.comments?.map((c, i) => <CommentItem key={i} comment={c} commentIdx={i} onUpdate={(idx, rt, et) => {
          const nl = [...post.comments];
          if(et) nl[idx].text = et;
          sync({ comments: nl });
        }} onDelete={(idx) => { if(confirm("삭제?")) { const nl = [...post.comments]; nl.splice(idx, 1); sync({ comments: nl }); } }} />)}
        <CommentInputRow>
          <CommentInput placeholder="따뜻한 댓글을 남겨주세요" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} />
          <CommentSubmit onClick={addComment}>등록</CommentSubmit>
        </CommentInputRow>
      </CommentSection>

      {showEditModal && <PostEditModal post={post} onSave={f => { sync({ ...f, edited: true }); setShowEditModal(false); }} onClose={() => setShowEditModal(false)} />}
    </Container>
  );
}
