import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  STATUS_LIST, STATUS_EMOJI, STATUS_CLASS,
  getTimeAgo, countComments, formatDateTime
} from "./homeConstants";
import { getPosts, updatePost } from "../api/posts";
import CategorySelector from "../components/home/CategorySelector";

// ── Styled Components ─────────────────────────────────────
const Container = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const HeaderArea = styled.div`
  max-width: 800px;
  margin: 0 auto 30px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-input-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 50px;
  padding: 0 20px;
  height: 50px;
  margin-bottom: 20px;
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
    box-shadow: 0 4px 12px rgba(253, 147, 25, 0.1);
  }

  svg {
    margin-right: 12px;
    color: var(--color-deactive);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 15px;
    color: var(--color-text);
    outline: none;

    &::placeholder {
      color: #aaa;
    }
  }
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
`;

const StatusFilterRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StatusFilterBtn = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-sidebar);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  &.active {
    background: var(--color-active);
    border-color: var(--color-active);
    color: white;
  }
`;

const WriteBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--color-active);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(253, 147, 25, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(253, 147, 25, 0.4);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 20px;
`;

const Card = styled.div`
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    border-color: var(--color-active);
  }
`;

const CardInner = styled.div`
  padding: 20px;
  flex: 1;
`;

const CardImgWrap = styled.div`
  width: 100%;
  height: 180px;
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  margin-right: 8px;

  &.status-open {
    background: #e1f5fe;
    color: #0288d1;
  }
  &.status-full {
    background: #ffebee;
    color: #d32f2f;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CardTime = styled.span`
  font-size: 11px;
  color: var(--color-deactive);
`;

const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const CardContent = styled.div`
  font-size: 14px;
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.6;
  margin-bottom: 4px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Tag = styled.span`
  padding: 3px 8px;
  background: #f1f3f5;
  color: #495057;
  border-radius: 4px;
  font-size: 11px;
`;

const CardFooter = styled.div`
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CapProgress = styled.div`
  flex: 1;
`;

const CapText = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
`;

const CapBar = styled.div`
  width: 80px;
  height: 5px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const CapFill = styled.div`
  height: 100%;
  background: var(--color-active);
  transition: width 0.3s ease;
`;

const FooterBtns = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;

  &.liked {
    color: #ff4757;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 100px 0;
  text-align: center;
  color: var(--color-deactive);

  .icon { font-size: 60px; margin-bottom: 20px; }
  p { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: var(--color-text); }
  span { font-size: 14px; }
`;

// ── Components ────────────────────────────────────────────
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
    <Card onClick={() => onOpen(post.id)}>
      <CardInner>
        <CardImgWrap>
          {post.image
            ? <img src={post.image} alt="" />
            : <div style={{ background: "#f0f0f0", height: "100%" }} />}
        </CardImgWrap>
        <CardHeader>
          <StatusBadge className={STATUS_CLASS[post.status] || "status-open"}>
            {STATUS_EMOJI[post.status] || ""} {post.status || "모집중"}
          </StatusBadge>
          <CardTime>{getTimeAgo(post.createdAt)}</CardTime>
        </CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardContent>{post.content}</CardContent>

        {ds && (
          <MetaItem>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {ds}
          </MetaItem>
        )}
        {post.place && (
          <MetaItem>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {post.place}
          </MetaItem>
        )}
        
        {tags.length > 0 && (
          <TagRow>
            {tags.map(([, v]) => <Tag key={v}>{v}</Tag>)}
          </TagRow>
        )}
      </CardInner>

      <CardFooter>
        <CapProgress>
          <CapText>{participants} / {capacity}명</CapText>
          <CapBar><CapFill style={{ width: `${pct}%` }} /></CapBar>
        </CapProgress>
        <FooterBtns>
          <ActionBtn
            className={liked ? "liked" : ""}
            onClick={(e) => { e.stopPropagation(); onLike(post); }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24"
              fill={liked ? "#ff4757" : "none"}
              stroke={liked ? "#ff4757" : "currentColor"} strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.likes || 0}
          </ActionBtn>
          <ActionBtn as="span">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {total}
          </ActionBtn>
        </FooterBtns>
      </CardFooter>
    </Card>
  );
}

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
    }
  };

  return (
    <Container>
      <HeaderArea>
        <SearchBar>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="함께 하고 싶은 활동을 찾아보세요" value={search} onChange={(e) => setSearch(e.target.value)} />
        </SearchBar>

        <FilterRow>
          <StatusFilterRow>
            {["", ...STATUS_LIST].map((s) => (
              <StatusFilterBtn key={s} className={selStatus === s ? "active" : ""} onClick={() => setSelStatus(s)}>
                {s === "" ? "전체" : `${STATUS_EMOJI[s]} ${s}`}
              </StatusFilterBtn>
            ))}
          </StatusFilterRow>
          <WriteBtn onClick={() => navigate("/write")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            모집하기
          </WriteBtn>
        </FilterRow>

        <div style={{ marginBottom: "16px" }}>
          <CategorySelector selected={selCats} onChange={setSelCats} />
        </div>
      </HeaderArea>

      <CardList>
        {filtered.length === 0 ? (
          <EmptyState>
            <div className="icon">🤷</div>
            <p>조건에 맞는 게시글이 없어요</p>
            <span>새로운 모임을 직접 만들어보세요!</span>
          </EmptyState>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onOpen={(id) => navigate("/detail/" + id)}
            />
          ))
        )}
      </CardList>
    </Container>
  );
}
