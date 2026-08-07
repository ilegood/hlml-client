import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext.jsx";
import { togglePostLike } from "../../api/posts";
import CategorySelector from "../../components/Post_Components/CategorySelector";
import SortDropdown from "../../components/post_components/SortDropdown";
import CentralMapBar from "../../components/post_components/CentralMapBar";
import { usePostsData } from "../../hooks/usePostsData";
import PostListDisplay from "../../components/post_pages/PostListDisplay";

export default function MainPage() {
  const navigate = useNavigate();
  const { userId, token } = useAuth();
  const {
    paginatedPosts,
    totalPages,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    selCats,
    setSelCats,
    fetchPosts,
    setPosts,
    sortBy,
    setSortBy,
    SORT_OPTIONS,
    MAIN_CATEGORY_ORDER,
  } = usePostsData();

  useEffect(() => {
    const handleFocus = () => fetchPosts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchPosts]);

  const handleLike = async (post) => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const currentUserId = String(userId);
    const wasLiked = (post.likedBy || []).map(String).includes(currentUserId);
    const optimisticPost = {
      ...post,
      likes: Math.max(0, (post.likes || 0) + (wasLiked ? -1 : 1)),
      likedBy: wasLiked
        ? (post.likedBy || []).filter((id) => String(id) !== currentUserId)
        : [...(post.likedBy || []), currentUserId],
    };

    setPosts((prev) =>
      prev.map((item) => (item.id === post.id ? optimisticPost : item)),
    );

    try {
      const updated = await togglePostLike(post.id);
      setPosts((prev) =>
        prev.map((item) => (item.id === post.id ? updated : item)),
      );
    } catch (err) {
      console.error("Failed to update like:", err);
      setPosts((prev) => prev.map((item) => (item.id === post.id ? post : item)));
      toast.error("찜 처리에 실패했습니다.");
    }
  };

  const handleWriteClick = () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate("/write");
  };

  return (
    <main className="[max-width:900px] [margin:0_auto] [padding:16px]">
      <div className="[margin:0_auto]">
        <div className="[display:flex] [align-items:center] [gap:10px] [background:var(--color-sidebar)] [border:1.5px_solid_var(--color-border)] [border-radius:12px] [padding:10px_14px] [margin-bottom:12px] [transition:border-color_0.15s,_box-shadow_0.15s] [border-color:var(--color-active)] [box-shadow:0_0_0_3px_rgba(253,_147,_25,_0.06)] [&_svg]:[color:var(--color-deactive)] [&_svg]:[flex-shrink:0]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="[border:none] [outline:none] [background:transparent] [font-size:14px] [font-family:inherit] [color:var(--color-text)] [width:100%] [color:#bbb]"
            placeholder="제목이나 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:30px] [gap:12px] [flex-wrap:wrap]">
          <div className="[display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap]">
            <button
              className={`rounded-[20px] border-[1.5px] border-solid px-3 py-[5px] text-[12px] font-semibold transition-all hover:border-[var(--color-active)] hover:text-[var(--color-active)] ${
                Object.values(selCats).every((value) => !value)
                  ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-sidebar)] text-[var(--color-text)]"
              }`}
              onClick={() => setSelCats({})}
            >
              전체
            </button>
            <CategorySelector
              selected={selCats}
              onChange={setSelCats}
              order={MAIN_CATEGORY_ORDER}
            />
          </div>
          <div className="[display:flex] [align-items:center] [gap:8px]">
            <SortDropdown value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
            <button className="[display:flex] [align-items:center] [gap:5px] [background:#07b1bc] [color:white] [border:none] [padding:7px_14px] [border-radius:20px] [font-size:13px] [font-weight:600] [cursor:pointer] [font-family:inherit] [transition:background_0.15s,_transform_0.1s] [flex-shrink:0] hover:[background:#06a0ab] hover:[transform:translateY(-1px)] active:[transform:translateY(0)]" onClick={handleWriteClick}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              게시글 작성
            </button>
          </div>
        </div>
      </div>

      <CentralMapBar />

      <PostListDisplay
        filteredPosts={paginatedPosts}
        handleLike={handleLike}
        onOpen={(id) => navigate(`/detail/${id}`)}
        currentUserId={userId || "me"}
      />

      <div className="[margin-top:24px] [display:flex] [align-items:center] [justify-content:center] [gap:10px] [flex-wrap:wrap]">
        <button
          type="button"
          className="[min-width:38px] [height:34px] [padding:0_12px] [border:1.5px_solid_var(--color-border)] [border-radius:20px] [background:var(--color-sidebar)] [color:var(--color-text)] [font:inherit] [font-size:12px] [font-weight:700] [cursor:pointer] [transition:border-color_0.15s,_color_0.15s,_background_0.15s] [border-color:var(--color-active)] [color:var(--color-active)] disabled:[opacity:0.45] disabled:[cursor:not-allowed]"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>

        <div className="[display:flex] [align-items:center] [gap:6px] [flex-wrap:wrap] [justify-content:center]">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`h-[34px] min-w-[38px] rounded-[20px] border-[1.5px] border-solid px-3 text-[12px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                currentPage === page
                  ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-sidebar)] text-[var(--color-text)]"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="[min-width:38px] [height:34px] [padding:0_12px] [border:1.5px_solid_var(--color-border)] [border-radius:20px] [background:var(--color-sidebar)] [color:var(--color-text)] [font:inherit] [font-size:12px] [font-weight:700] [cursor:pointer] [transition:border-color_0.15s,_color_0.15s,_background_0.15s] [border-color:var(--color-active)] [color:var(--color-active)] disabled:[opacity:0.45] disabled:[cursor:not-allowed]"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </main>
  );
}
