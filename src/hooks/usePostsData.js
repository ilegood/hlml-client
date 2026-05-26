import { useCallback, useEffect, useMemo, useState } from "react";
import { getPosts } from "../api/posts";

const MAIN_CATEGORY_ORDER = ["인원", "성별", "나이", "흡연", "음주", "활동"];
const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "title", label: "이름순" },
  { value: "date", label: "약속 날짜순" },
  { value: "popular", label: "인기순" },
];

const getSortFn = (sortBy) => {
  switch (sortBy) {
    case "oldest":
      return (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
    case "title":
      return (a, b) => a.title.localeCompare(b.title, "ko");
    case "date":
      return (a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      };
    case "popular":
      return (a, b) => (b.likes || 0) - (a.likes || 0);
    default:
      return (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  }
};

export const usePostsData = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selCats, setSelCats] = useState({});
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setPosts(await getPosts({ visibleOnly: true }));
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    const sortFn = getSortFn(sortBy);
    const keyword = search.toLowerCase();

    return [...posts]
      .sort(sortFn)
      .filter((post) => {
        const matchText =
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          (post.place && post.place.toLowerCase().includes(keyword));
        const matchCat = Object.entries(selCats).every(([key, value]) => {
          if (!value) return true;
          if (key === "인원") return post.capacity === parseInt(value, 10);
          return post.categories?.[key] === value;
        });
        return matchText && matchCat;
      });
  }, [posts, search, selCats, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, effectivePage]);

  return {
    posts,
    setPosts,
    filteredPosts,
    paginatedPosts,
    search,
    setSearch,
    selCats,
    setSelCats,
    fetchPosts,
    sortBy,
    setSortBy,
    currentPage: effectivePage,
    setCurrentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    SORT_OPTIONS,
    MAIN_CATEGORY_ORDER,
  };
};
