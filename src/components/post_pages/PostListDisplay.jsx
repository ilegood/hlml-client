import PostCard from "../post_components/PostCard";
import styles from "../../pages/post_pages/MainPage.module.css";

export default function PostListDisplay({
  filteredPosts,
  handleLike,
  onOpen,
  currentUserId,
}) {
  return (
    <div className={styles.cardList}>
      {filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⌕</div>
          <p>아직 게시글이 없습니다.</p>
          <span>첫 번째 글을 작성해보세요.</span>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant="main"
            onLike={handleLike}
            onOpen={onOpen}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  );
}
