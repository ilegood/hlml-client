import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATEGORY_MAP, STATUS_LIST, STATUS_EMOJI, STATUS_CLASS,
  getTimeAgo, countComments, formatDateTime
} from "./constants";
import { getPosts, updatePost } from "../../api/post";
import CategorySelector from "./components/CategorySelector";
import "./App.css";

// ── 카드 ────────────────────────────────────────────────
function PostCard({ post, onLike, onOpen }) {
  if (!post) return null;
  const liked = Array.isArray(post.likedBy) ? post.likedBy.includes("me") : false;
  const participants = post.participants || 0;
  const capacity = post.capacity || 4;
  const pct = Math.min(100, Math.round((participants / capacity) * 100));
  const tags = post.categories ? Object.entries(post.categories).filter(([, v]) => v) : [];
  const ds = formatDateTime(post.date, post.time);
  const total = countComments(post.comments || []);

  return (
    <div className="card" onClick={() => onOpen(post.id)}>
      <div className="card-inner">
        <div className="card-img-wrap">
          {post.image
            ? <img src={post.image} className="card-img" alt="" />
            : <div className="card-img" style={{ background: "#f0f0f0", borderRadius: "10px" }} />}
        </div>
        <div className="card-body">
          <div className="card-header-row">
            <span className={`status-badge ${STATUS_CLASS[post.status] || "status-open"}`}>
              {STATUS_EMOJI[post.status] || ""} {post.status || "모집중"}
            </span>
            {post.edited && <span className="edited-badge sm">수정됨</span>}
            <span className="card-time">{getTimeAgo(post.createdAt)}</span>
          </div>
          <div className="card-title">{post.title}</div>
          
          <div className="card-content">{post.content}</div>

          {ds && (
            <div className="card-datetime">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {ds}
            </div>
          )}
          {post.place && (
            <div className="card-place">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {post.place}
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="card-tags">
              {tags.map(([, v]) => <span className="tag" key={v}>{v}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="card-footer">
        <div className="cap-progress-wrap">
          <div className="cap-text">{participants} / {capacity}명 참여중</div>
          <div className="cap-bar"><div className="cap-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card-footer-btns">
          <button
            className={`action-btn${liked ? " liked-btn" : ""}`}
            onClick={(e) => { e.stopPropagation(); onLike(post); }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill={liked ? "#ff4757" : "none"}
              stroke={liked ? "#ff4757" : "currentColor"} strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.likes || 0}
          </button>
          <span className="comment-count">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────
export default function MainPage() {
  const navigate = useNavigate();
  const [posts,      setPosts]      = useState([]);
  const [search,     setSearch]     = useState("");
  const [selStatus,  setSelStatus]  = useState("");
  const [selCats,    setSelCats]    = useState({});

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((it) => {
      const kw = search.toLowerCase();
      const matchText = it.title.toLowerCase().includes(kw) || it.content.toLowerCase().includes(kw);
      const matchCat  = Object.entries(selCats).every(([k, v]) => !v || it.categories?.[k] === v);
      const matchStat = !selStatus || it.status === selStatus;
      return matchText && matchCat && matchStat;
    });

  const handleLike = async (post) => {
    const likedBy = post.likedBy || [];
    const idx = likedBy.indexOf("me");
    let newLikedBy = [...likedBy];
    let newLikes = post.likes || 0;

    if (idx === -1) {
      newLikedBy.push("me");
      newLikes += 1;
    } else {
      newLikedBy.splice(idx, 1);
      newLikes = Math.max(0, newLikes - 1);
    }

    try {
      await updatePost(post.id, { ...post, likedBy: newLikedBy, likes: newLikes });
      fetchPosts();
    } catch (err) {
      console.error("Failed to update like:", err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  return (
    <main className="container">
            {/* 상단 컨트롤 영역 (너비 확장) */}
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>          {/* 검색 */}
          <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="제목이나 내용 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* 상태 필터 및 작성 버튼 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div className="status-filter-row" style={{ marginBottom: 0 }}>
              {["", ...STATUS_LIST].map((s) => (
                <button key={s} className={`status-filter-btn${selStatus === s ? " active" : ""}`} onClick={() => setSelStatus(s)}>
                  {s === "" ? "전체" : `${STATUS_EMOJI[s]} ${s}`}
                </button>
              ))}
            </div>
            <button className="write-btn" onClick={() => navigate("/write")} style={{ flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: "4px" }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              게시글 작성
            </button>
          </div>

          {/* 카테고리 */}
          <div style={{ marginBottom: "16px" }}>
            <CategorySelector selected={selCats} onChange={setSelCats} />
          </div>
        </div>

        {/* 카드 목록 (컨테이너 전체 너비 사용) */}
        <div className="card-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🙈</div>
              <p>아직 게시글이 없어요</p>
              <span>첫 번째 글을 작성해보세요!</span>
            </div>
          ) : (
            filtered.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onOpen={(id) => navigate("/detail/" + id)}
              />
            ))
          )}
        </div>
      </main>
  );
}
