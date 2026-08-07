import PostCard from "../../components/post_components/PostCard";
import { useMyPosts } from "../../hooks/useMyPosts";

export default function MyPostsPage() {
  const { currentUserId, goBack, myPosts, openChatRoom } = useMyPosts();

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-[30px] flex items-center gap-[15px] [&_h2]:text-[24px] [&_h2]:font-extrabold">
        <button
          className="cursor-pointer border-0 bg-transparent text-[var(--color-text)]"
          onClick={goBack}
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
        <h2>내 게시글</h2>
      </div>

      {myPosts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
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
        <div className="py-[100px] text-center text-[var(--color-deactive)]">
          <div className="mb-2.5 text-[48px]">＋</div>
          <p>작성한 게시글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
