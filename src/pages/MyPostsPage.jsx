import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import { getPosts, updatePost } from "../api/posts";
import {
  STATUS_EMOJI,
  STATUS_CLASS,
  getTimeAgo,
} from "../api/homeConstants";

const cardIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  .header {
    display: flex; align-items: center; gap: 15px; margin-bottom: 30px;
    .back-btn { background: none; border: none; cursor: pointer; color: var(--color-text); }
    h2 { font-size: 24px; font-weight: 800; }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .empty {
    text-align: center; padding: 100px 0; color: var(--color-deactive);
    .icon { font-size: 48px; margin-bottom: 10px; }
  }
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

const CardFooter = styled.div`
  padding: 10px 14px 14px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 10px;
`;

function MyPostCard({ post, onClick }) {
  return (
    <Card onClick={onClick}>
      <CardInner>
        <CardImgWrap>
          {post.image ? (
            <CardImg src={post.image} alt="" />
          ) : (
            <div style={{ background: "#f0f0f0", height: "100%", borderRadius: "10px" }} />
          )}
        </CardImgWrap>
        <CardBody>
          <CardHeaderRow>
            <StatusBadge className={STATUS_CLASS[post.status] || "status-open"}>
              {STATUS_EMOJI[post.status] || ""} {post.status || "모집중"}
            </StatusBadge>
            <CardTime>{getTimeAgo(post.createdAt)}</CardTime>
          </CardHeaderRow>
          <CardTitle>{post.title}</CardTitle>
          <CardContent>{post.content}</CardContent>
        </CardBody>
      </CardInner>
      <CardFooter>
        <div style={{ fontSize: '11px', color: '#aaa' }}>
          {post.participants || 0} / {post.capacity || 4}명 참여중
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#aaa' }}>
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes || 0}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function MyPostsPage() {
  const navigate = useNavigate();
  const { name } = useAuth();
  const [myPosts, setMyPosts] = useState([]);

  const fetchMyPosts = async () => {
    try {
      const allPosts = await getPosts();
      const userId = name || "me";
      const filtered = allPosts.filter(p => p.author === userId);
      setMyPosts(filtered);
    } catch (err) {
      console.error("Failed to fetch my posts:", err);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [name]);

  return (
    <PageWrapper>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2>올린 게시글</h2>
      </div>

      {myPosts.length > 0 ? (
        <div className="grid">
          {myPosts.map(post => (
            <MyPostCard 
              key={post.id} 
              post={post} 
              onClick={() => navigate(`/detail/${post.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="icon">📝</div>
          <p>작성한 게시글이 없습니다.</p>
        </div>
      )}
    </PageWrapper>
  );
}
