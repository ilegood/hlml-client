import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getPosts } from "../../api/posts";
import PostCard from "../../components/Post_Components/PostCard";
import styles from "./MyPostsPage.module.css";

export default function MyPostsPage() {
  const navigate = useNavigate();
  const { name } = useAuth();
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const allPosts = await getPosts();
        const filtered = allPosts.filter((p) => p.author === (name || "me"));
        setMyPosts(filtered);
      } catch (err) {
        console.error("Failed to fetch my posts:", err);
      }
    };
    fetchMyPosts();
  }, [name]);

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
        <h2>올린 게시글</h2>
      </div>

      {myPosts.length > 0 ? (
        <div className={styles.grid}>
          {myPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="my-posts"
              onOpen={(id) => navigate(`/detail/${id}`)}
              currentUserId={name || "me"}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📝</div>
          <p>작성한 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
