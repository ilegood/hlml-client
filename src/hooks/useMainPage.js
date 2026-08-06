import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { togglePostLike } from "../api/posts";
import { usePostsData } from "./usePostsData";

export default function useMainPage() {
  const navigate = useNavigate();
  const { userId, token } = useAuth();
  const posts = usePostsData();

  const fetchOnFocus = useCallback(() => posts.fetchPosts(), [posts.fetchPosts]);
  useEffect(() => {
    window.addEventListener("focus", fetchOnFocus);
    return () => window.removeEventListener("focus", fetchOnFocus);
  }, [fetchOnFocus]);

  const handleLike = useCallback(async (post) => {
    if (!token) {
      toast.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
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
    posts.setPosts((prev) => prev.map((item) => item.id === post.id ? optimisticPost : item));
    try {
      const updated = await togglePostLike(post.id);
      posts.setPosts((prev) => prev.map((item) => item.id === post.id ? updated : item));
    } catch (err) {
      console.error("Failed to update like:", err);
      posts.setPosts((prev) => prev.map((item) => item.id === post.id ? post : item));
      toast.error("醫뗭븘??泥섎━???ㅽ뙣?덉뒿?덈떎.");
    }
  }, [navigate, posts, token, userId]);

  const handleWriteClick = useCallback(() => {
    if (!token) {
      toast.error("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
      navigate("/login");
      return;
    }
    navigate("/write");
  }, [navigate, token]);

  return { ...posts, userId, handleLike, handleWriteClick };
}
