import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import { getPosts, togglePostLike } from "../../api/posts";
import CategorySelector from "../../components/Post_Components/CategorySelector";
import PostCard from "../../components/Post_Components/PostCard";
import CentralMapBar from "../../components/Post_Components/CentralMapBar";
import styles from "./MainPage.module.css";

const MAIN_CATEGORY_ORDER = ["인원", "성별", "나이", "흡연", "음주", "활동"];

export default function MainPage() {
  const navigate = useNavigate();
  const { name, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selCats, setSelCats] = useState({});

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadPosts = async () => {
      try {
        const data = await getPosts();
        if (!ignore) setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    loadPosts();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((it) => {
      const kw = search.toLowerCase();
      const matchText =
        it.title.toLowerCase().includes(kw) ||
        it.content.toLowerCase().includes(kw);
      const matchCat = Object.entries(selCats).every(([k, v]) => {
        if (!v) return true;
        if (k === "인원") return it.capacity === parseInt(v);
        return it.categories?.[k] === v;
      });
      return matchText && matchCat;
    });

  const handleLike = async (post) => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    try {
      await togglePostLike(post.id);
      fetchPosts();
    } catch (err) {
      console.error("Failed to update like:", err);
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
        {/* 검색 */}
        <div className={styles.searchBar}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
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

        {/* 필터 + 작성 버튼 한 줄로 */}
        <div className={styles.filterRow}>
          <div className={styles.categoryWrap}>
            <button
              className={`${styles.categoryAllBtn}${Object.values(selCats).every((v) => !v) ? ` ${styles.active}` : ""}`}
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
          <button className={styles.writeBtn} onClick={handleWriteClick}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            게시글 작성
          </button>
        </div>
      </div>

      <CentralMapBar />

      {/* 카드 목록 */}
      <div className={styles.cardList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🙈</div>
            <p>아직 게시글이 없어요</p>
            <span>첫 번째 글을 작성해보세요!</span>
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              variant="main"
              onLike={handleLike}
              onOpen={(id) => navigate("/detail/" + id)}
              currentUserId={name || "me"}
            />
          ))
        )}
      </div>
    </main>
  );
}
