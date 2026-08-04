import PostCard from "../../components/post_components/PostCard";
<<<<<<< Updated upstream
import styles from "./MyPostsPage.module.css";
=======
import { useMyPosts } from "../../hooks/useMyPosts";
>>>>>>> Stashed changes

export default function MyPostsPage() {
  const { currentUserId, goBack, myPosts, openChatRoom } = useMyPosts();

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
        <h2>올린 게시글</h2>
      </div>

      {myPosts.length > 0 ? (
        <div className={styles.grid}>
          {myPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="my-posts"
              onOpen={openChatRoom}
              currentUserId={currentUserId}
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
