import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getPosts, togglePostLike } from "../../api/posts";
import PostCard from "../../components/post_components/PostCard";
import styles from "./LikesPage.module.css";

export default function LikesPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const allPosts = await getPosts();
        const currentUserId = userId || "me";
        const filtered = allPosts.filter(
          (p) =>
            Array.isArray(p.likedBy) &&
            p.likedBy.includes(String(currentUserId)),
        );
        setLikedPosts(filtered);
      } catch (err) {
        console.error("Failed to fetch liked posts:", err);
      }
    };
    fetchLikedPosts();
  }, [userId]);

  const handleLike = async (post) => {
    const currentUserId = userId || "me";
    const previous = likedPosts;

    setLikedPosts((prev) => prev.filter((p) => p.id !== post.id));

    try {
      const updated = await togglePostLike(post.id);
      setLikedPosts((prev) =>
        prev.filter(
          (p) =>
            p.id !== post.id || updated.likedBy.includes(String(currentUserId)),
        ),
      );
    } catch (err) {
      console.error("Failed to update like:", err);
      setLikedPosts(previous);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2>찜 목록</h2>
      </div>

      {likedPosts.length > 0 ? (
        <div className={styles.grid}>
          {likedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="likes"
              onLike={handleLike}
              onOpen={(id) => navigate(`/detail/${id}`)}
              currentUserId={userId || "me"}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⭐</div>
          <p>찜한 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
