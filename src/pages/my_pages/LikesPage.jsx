import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getPosts, togglePostLike } from "../../api/posts";
import PostCard from "../../components/post_components/PostCard";

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
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-[30px] flex items-center gap-[15px]">
        <button
          className="cursor-pointer border-0 bg-transparent text-[var(--color-text)]"
          onClick={() => navigate(-1)}
        >
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
        <h2 className="text-[24px] font-extrabold">찜 목록</h2>
      </div>

      {likedPosts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
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
        <div className="py-[100px] text-center text-[var(--color-deactive)]">
          <div className="mb-[10px] text-[48px]">⭐</div>
          <p>찜한 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
