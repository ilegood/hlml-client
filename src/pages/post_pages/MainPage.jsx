import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { togglePostLike } from "../../api/posts";
import CategorySelector from "../../hooks/CategorySelector";
import SortDropdown from "../../components/post_components/SortDropdown";
import CentralMapBar from "../../components/post_components/CentralMapBar";
import styles from "./MainPage.module.css";
import { usePostsData } from "../../hooks/usePostsData";
import PostListDisplay from "./PostListDisplay";

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
    <main className={styles.container}>
      <div className={styles.headerControls}>
        <div className={styles.searchBar}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="제목이나 내용 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.categoryWrap}>
            <button
              className={`${styles.categoryAllBtn}${Object.values(selCats).every((value) => !value) ? ` ${styles.active}` : ""}`}
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
          <div className={styles.sortRow}>
            <SortDropdown value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
            <button className={styles.writeBtn} onClick={handleWriteClick}>
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

      <div className={styles.paginationBar}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>

        <div className={styles.pageNumbers}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`${styles.pageBtn}${currentPage === page ? ` ${styles.pageBtnActive}` : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </main>
  );
}
