import { useState, useEffect } from "react";
import { getPosts } from "../api/posts"; // Assuming getPosts is in this path

const MAIN_CATEGORY_ORDER = ["인원", "성별", "나이", "흡연", "음주", "활동"]; // Keep this for filtering logic

export const usePostsData = () => {
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

  const filteredPosts = [...posts]
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

  return {
    posts,
    filteredPosts,
    search,
    setSearch,
    selCats,
    setSelCats,
    fetchPosts,
    MAIN_CATEGORY_ORDER,
  };
};
