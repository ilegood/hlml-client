import { useCallback, useEffect, useState } from "react";
import { getPosts } from "../api/posts";

const MAIN_CATEGORY_ORDER = ["인원", "성별", "나이", "흡연", "음주", "활동"];

export const usePostsData = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selCats, setSelCats] = useState({});

  const fetchPosts = useCallback(async () => {
    try {
      setPosts(await getPosts());
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((post) => {
      const keyword = search.toLowerCase();
      const matchText =
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword);
      const matchCat = Object.entries(selCats).every(([key, value]) => {
        if (!value) return true;
        if (key === "인원") return post.capacity === parseInt(value, 10);
        return post.categories?.[key] === value;
      });
      return matchText && matchCat;
    });

  return {
    posts,
    setPosts,
    filteredPosts,
    search,
    setSearch,
    selCats,
    setSelCats,
    fetchPosts,
    MAIN_CATEGORY_ORDER,
  };
};
