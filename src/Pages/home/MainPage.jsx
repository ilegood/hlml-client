import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  STATUS_LIST, STATUS_EMOJI, STATUS_CLASS,
  getTimeAgo, countComments, formatDateTime
} from "./constants";
import { getPosts, updatePost } from "../../api/post";
import CategorySelector from "./components/CategorySelector";
import "./App.css";

const PostCard = ({ post, onLike, onOpen }) => {
  const { id, title, content, status, image, edited, createdAt, date, time, place, participants = 0, capacity = 4, likedBy = [], likes = 0, categories = {}, comments = [] } = post;
  const isClosed = status === "모집완료";
  const liked = likedBy.includes("me");
  const pct = Math.min(100, Math.round((participants / capacity) * 100));
  const tags = Object.entries(categories).filter(([, v]) => v);
  const ds = formatDateTime(date, time);

  return (
    <div className={`card ${isClosed ? "card-closed" : ""}`} onClick={() => onOpen(id)}>
      <div className="card-inner">
        <div className="card-img-wrap">
          {image ? <img src={image} className="card-img" alt="" /> : <div className="card-img" style={{ background: "#f0f0f0", borderRadius: "10px" }} />}
        </div>
        <div className="card-body">
          <div className="card-header-row">
            <span className={`status-badge ${STATUS_CLASS[status] || "status-open"}`}>{STATUS_EMOJI[status]} {status || "모집중"}</span>
            {edited && <span className="edited-badge sm">수정됨</span>}
            <span className="card-time">{getTimeAgo(createdAt)}</span>
          </div>
          <div className="card-title">{title}</div>
          <div className="card-content">{content}</div>
          {ds && <div className="card-datetime"><IconCalendar /> {ds}</div>}
          {place && <div className="card-place"><IconMap /> {place}</div>}
          {tags.length > 0 && <div className="card-tags">{tags.map(([, v]) => <span className="tag" key={v}>{v}</span>)}</div>}
        </div>
      </div>
      <div className="card-footer">
        <div className="cap-progress-wrap">
          <div className="cap-text">{participants} / {capacity}명 참여중</div>
          <div className="cap-bar"><div className="cap-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card-footer-btns">
          <button className={`action-btn${liked ? " liked-btn" : ""}`} onClick={(e) => { e.stopPropagation(); onLike(post); }}>
            <IconHeart fill={liked ? "#ff4757" : "none"} stroke={liked ? "#ff4757" : "currentColor"} /> {likes}
          </button>
          <span className="comment-count"><IconComment /> {countComments(comments)}</span>
        </div>
      </div>
    </div>
  );
};

// 작은 아이콘 컴포넌트들
const IconCalendar = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconMap = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconHeart = ({ fill, stroke }) => <svg width="12" height="12" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IconComment = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;

export default function MainPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selStatus, setSelStatus] = useState("");
  const [selCats, setSelCats] = useState({});

  const load = async () => { try { setPosts(await getPosts()); } catch (err) { console.error(err); } };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return posts
      .filter(p => {
        const matchText = p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
        const matchCat = Object.entries(selCats).every(([k, v]) => !v || p.categories?.[k] === v);
        const matchStat = !selStatus || p.status === selStatus;
        return matchText && matchCat && matchStat;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [posts, search, selCats, selStatus]);

  const handleLike = async (post) => {
    const list = post.likedBy || [];
    const idx = list.indexOf("me");
    const newList = idx === -1 ? [...list, "me"] : list.filter(m => m !== "me");
    try {
      await updatePost(post.id, { ...post, likedBy: newList, likes: newList.length });
      load();
    } catch (err) { alert("오류가 발생했습니다."); }
  };

  return (
    <main className="container">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="제목이나 내용 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div className="status-filter-row">
            {["", ...STATUS_LIST].map(s => (
              <button key={s} className={`status-filter-btn${selStatus === s ? " active" : ""}`} onClick={() => setSelStatus(s)}>
                {s === "" ? "전체" : `${STATUS_EMOJI[s]} ${s}`}
              </button>
            ))}
          </div>
          <button className="write-btn" onClick={() => navigate("/write")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: 4 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            게시글 작성
          </button>
        </div>
        <div style={{ marginBottom: 16 }}><CategorySelector selected={selCats} onChange={setSelCats} /></div>
      </div>

      <div className="card-list">
        {filtered.length ? filtered.map(p => <PostCard key={p.id} post={p} onLike={handleLike} onOpen={id => navigate("/detail/" + id)} />) 
                        : <div className="empty-state">아직 게시글이 없어요</div>}
      </div>
    </main>
  );
}
