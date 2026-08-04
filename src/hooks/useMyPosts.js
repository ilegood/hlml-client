import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../api/posts";
import { useAuth } from "../context/AuthContext.jsx";

export const useMyPosts = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const allPosts = await getPosts();
        const filtered = allPosts.filter(
          (p) => String(p.user_id) === String(userId),
        );
        setMyPosts(filtered);
      } catch (err) {
        console.error("Failed to fetch my posts:", err);
      }
    };
    fetchMyPosts();
  }, [userId]);

  return {
    currentUserId: userId || "me",
    goBack: () => navigate(-1),
    myPosts,
    openChatRoom: (id) => navigate(`/chat/${id}`),
    userId,
  };
};
