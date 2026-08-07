import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, togglePostLike } from "../api/posts";
import { useAuth } from "../context/AuthContext.jsx";

export const useLikedPosts = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const allPosts = await getPosts();
        const currentUserId = userId || "me";
        const filtered = allPosts.filter(
          (p) =>
            Array.isArray(p.likedBy) &&
            p.likedBy.includes(String(currentUserId)),
        );
        setLikedPosts(filtered);
      } catch (err) {
        console.error("Failed to fetch liked posts:", err);
      }
    };
    fetchLikedPosts();
  }, [userId]);

  const handleLike = async (post) => {
    const currentUserId = userId || "me";
    const previous = likedPosts;

    setLikedPosts((prev) => prev.filter((p) => p.id !== post.id));

    try {
      const updated = await togglePostLike(post.id);
      setLikedPosts((prev) =>
        prev.filter(
          (p) =>
            p.id !== post.id || updated.likedBy.includes(String(currentUserId)),
        ),
      );
    } catch (err) {
      console.error("Failed to update like:", err);
      setLikedPosts(previous);
    }
  };

  return {
    currentUserId: userId || "me",
    goBack: () => navigate(-1),
    handleLike,
    likedPosts,
    openPost: (id) => navigate(`/detail/${id}`),
    userId,
  };
};
