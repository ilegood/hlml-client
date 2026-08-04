import PostCard from "../../components/post_components/PostCard";
<<<<<<< Updated upstream
import styles from "./LikesPage.module.css";
=======
import { useLikedPosts } from "../../hooks/useLikedPosts";
>>>>>>> Stashed changes

export default function LikesPage() {
  const { currentUserId, goBack, handleLike, likedPosts, openPost } =
    useLikedPosts();

  return (
<<<<<<< Updated upstream
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
=======
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-[30px] flex items-center gap-[15px]">
        <button
          className="cursor-pointer border-0 bg-transparent text-[var(--color-text)]"
          onClick={goBack}
        >
>>>>>>> Stashed changes
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
              onOpen={openPost}
              currentUserId={currentUserId}
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
