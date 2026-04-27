import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import {
  STATUS_LIST,
  STATUS_EMOJI,
  STATUS_CLASS,
  getTimeAgo,
  countComments,
  formatDateTime,
} from "../api/homeConstants";
import { getPosts, updatePost } from "../api/posts";
import CategorySelector from "../components/CategorySelector";

// ── Animations ────────────────────────────────────────────
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ── Styled Components ─────────────────────────────────────
const Container = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
`;

const HeaderControls = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-sidebar);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 12px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus-within {
    border-color: var(--color-active);
    box-shadow: 0 0 0 3px rgba(253, 147, 25, 0.06);
  }

  svg {
    color: var(--color-deactive);
    flex-shrink: 0;
  }

  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    color: var(--color-text);
    width: 100%;

    &::placeholder {
      color: #bbb;
    }
  }
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatusFilterRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const StatusFilterBtn = styled.button`
  padding: 5px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-sidebar);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-text);
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  &.active {
    background: var(--color-active);
    color: white;
    border-color: var(--color-active);
  }
`;

const WriteBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #07b1bc;
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    transform 0.1s;
  flex-shrink: 0;

  &:hover {
    background: #06a0ab;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: var(--color-sidebar);
  border-radius: 14px;
  border: 1.5px solid var(--color-border);
  overflow: hidden;
  transition:
    box-shadow 0.2s,
    transform 0.2s,
    border-color 0.2s;
  animation: ${cardIn} 0.3s ease both;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.13);
    transform: translateY(-4px);
    border-color: var(--color-active);
  }
`;

const CardInner = styled.div`
  flex: 1;
  padding: 14px;
`;

const CardImgWrap = styled.div`
  width: 100%;
  height: 160px;
  margin-bottom: 12px;
  border-radius: 10px;
  overflow: hidden;
  background: #f0f0f0;
`;

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;

  &.status-open {
    background: #e8fdf0;
    color: #1a8a44;
  }
  &.status-full {
    background: #fff0f1;
    color: #c0392b;
  }
`;

const EditedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-weight: 600;
  color: #aaa;
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  padding: 1px 5px;
  border-radius: 10px;
`;

const CardTime = styled.span`
  font-size: 11px;
  color: #aaa;
  margin-left: auto;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--color-text);
`;

const CardContent = styled.div`
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.7;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 10px;
  line-height: 1.5;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  opacity: 0.8;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-deactive);
  margin-bottom: 4px;
`;

const CardFooter = styled.div`
  padding: 10px 14px 14px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CapProgressWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const CapText = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: 4px;
`;

const CapBar = styled.div`
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
  align-items: center;
  gap: 8px;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  color: var(--color-text);
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }

  &.liked {
    border-color: #ff4757;
    color: #ff4757;
  }
`;

const CommentCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #aaa;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text);
  opacity: 0.7;

  .icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
  p {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  span {
    font-size: 13px;
    color: #aaa;
  }
`;

// ── PostCard Component ────────────────────────────────────
function PostCard({ post, onLike, onOpen, currentUserId }) {
  if (!post) return null;
  const liked = Array.isArray(post.likedBy)
    ? post.likedBy.includes(currentUserId || "me")
    : false;
  const isAuthor = post.author === currentUserId;
  const participants = post.participants || 0;
  const capacity = post.capacity || 4;
  const pct = Math.min(100, Math.round((participants / capacity) * 100));
  const tags = post.categories
    ? Object.entries(post.categories).filter(([, v]) => v)
    : [];
  const ds = formatDateTime(post.date, post.time);
  const total = countComments(post.comments || []);

  return (
    <Card onClick={() => onOpen(post.id)}>
      <CardInner>
        <CardImgWrap>
          {post.image ? (
            <CardImg src={post.image} alt="" />
          ) : (
            <div
              style={{
                background: "#f0f0f0",
                height: "100%",
                borderRadius: "10px",
              }}
            />
          )}
        </CardImgWrap>
        <CardBody>
          <CardHeaderRow>
            <StatusBadge className={STATUS_CLASS[post.status] || "status-open"}>
              {STATUS_EMOJI[post.status] || ""} {post.status || "모집중"}
            </StatusBadge>
            {post.edited && <EditedBadge>수정됨</EditedBadge>}
            <CardTime>{getTimeAgo(post.createdAt)}</CardTime>
          </CardHeaderRow>
          <CardTitle>{post.title}</CardTitle>
          <CardContent>{post.content}</CardContent>

          {ds && (
            <MetaItem>
              <svg
                width="11"
                height="11"
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
              {ds}
            </MetaItem>
          )}
          {post.place && (
            <MetaItem>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {post.place}
            </MetaItem>
          )}

          {tags.length > 0 && (
            <TagRow>
              {tags.map(([, v]) => (
                <Tag key={v}>{v}</Tag>
              ))}
            </TagRow>
          )}
        </CardBody>
      </CardInner>

      <CardFooter>
        <CapProgressWrap>
          <CapText>
            {participants} / {capacity}명 참여중
          </CapText>
          <CapBar>
            <CapFill style={{ width: `${pct}%` }} />
          </CapBar>
        </CapProgressWrap>
        <FooterBtns>
          <ActionBtn
            className={liked ? "liked" : ""}
            onClick={(e) => {
              e.stopPropagation();
              onLike(post);
            }}
            disabled={isAuthor}
            style={{ opacity: isAuthor ? 0.5 : 1, cursor: isAuthor ? 'not-allowed' : 'pointer' }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={liked ? "#ff4757" : "none"}
              stroke={liked ? "#ff4757" : "currentColor"}
              strokeWidth="2.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes || 0}
          </ActionBtn>
          <CommentCount>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {total}
          </CommentCount>
        </FooterBtns>
      </CardFooter>
    </Card>
  );
}

// ── Main Page Component ───────────────────────────────────
export default function MainPage() {
  const navigate = useNavigate();
  const { name } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selStatus, setSelStatus] = useState("");
  const [selCats, setSelCats] = useState({});

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
      const matchText =
        it.title.toLowerCase().includes(kw) ||
        it.content.toLowerCase().includes(kw);
      const matchCat = Object.entries(selCats).every(
        ([k, v]) => !v || it.categories?.[k] === v,
      );
      const matchStat = !selStatus || it.status === selStatus;
      return matchText && matchCat && matchStat;
    });

  const handleLike = async (post) => {
    const likedBy = post.likedBy || [];
    const userId = name || "me";
    const idx = likedBy.indexOf(userId);
    let newLikedBy = [...likedBy];
    let newLikes = post.likes || 0;

    if (idx === -1) {
      newLikedBy.push(userId);
      newLikes += 1;
    } else {
      newLikedBy.splice(idx, 1);
      newLikes = Math.max(0, newLikes - 1);
    }

    try {
      await updatePost(post.id, {
        ...post,
        likedBy: newLikedBy,
        likes: newLikes,
      });
      fetchPosts();
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  return (
    <Container>
      <HeaderControls>
        <SearchBar>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="제목이나 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBar>

        <FilterRow>
          <StatusFilterRow>
            {["", ...STATUS_LIST].map((s) => (
              <StatusFilterBtn
                key={s}
                className={selStatus === s ? "active" : ""}
                onClick={() => setSelStatus(s)}
              >
                {s === "" ? "전체" : `${STATUS_EMOJI[s]} ${s}`}
              </StatusFilterBtn>
            ))}
          </StatusFilterRow>
          <WriteBtn onClick={() => navigate("/write")}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            게시글 작성
          </WriteBtn>
        </FilterRow>

        <div style={{ marginBottom: "16px" }}>
          <CategorySelector selected={selCats} onChange={setSelCats} />
        </div>
      </HeaderControls>

      <CardList>
        {filtered.length === 0 ? (
          <EmptyState>
            <div className="icon">🙈</div>
            <p>아직 게시글이 없어요</p>
            <span>첫 번째 글을 작성해보세요!</span>
          </EmptyState>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onOpen={(id) => navigate("/detail/" + id)}
              currentUserId={name || "me"}
            />
          ))
        )}
      </CardList>
    </Container>
  );
}
