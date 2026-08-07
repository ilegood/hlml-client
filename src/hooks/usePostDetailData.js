import { useCallback, useEffect, useState } from "react";
import { getPost } from "../api/posts";

export default function usePostDetailData(id) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPost = useCallback(async () => {
    const next = await getPost(id);
    setPost(next);
    return next;
  }, [id]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getPost(id)
      .then((next) => { if (active) setPost(next); })
      .catch((error) => console.error("Failed to fetch post:", error))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [id]);

  return { post, setPost, isLoading, refreshPost };
}
