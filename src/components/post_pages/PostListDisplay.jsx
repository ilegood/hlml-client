import PostCard from "../post_components/PostCard";

export default function PostListDisplay({
  filteredPosts,
  handleLike,
  onOpen,
  currentUserId,
}) {
  return (
    <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(300px,_1fr))] [gap:20px]">
      {filteredPosts.length === 0 ? (
        <div className="[grid-column:1_/_-1] [text-align:center] [padding:60px_20px] [color:var(--color-text)] [opacity:0.7] [&_p]:[font-size:16px] [&_p]:[font-weight:600] [&_p]:[margin-bottom:4px] [&_span]:[font-size:13px] [&_span]:[color:#aaa]">
          <div className="[font-size:40px] [margin-bottom:12px]">⌕</div>
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
