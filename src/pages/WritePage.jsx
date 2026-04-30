import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/auth";
import { todayString } from "../api/homeConstants";
import { createPost, getPost, updatePost } from "../api/posts";
import CategorySelector from "../components/CategorySelector";
import ImageDropZone from "../components/ImageDropZone";
import styles from "./WritePage.module.css";

export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { name } = useAuth();

  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState("모집중");
  const [categories, setCategories] = useState({});

  // 🔥 핵심: 이미지 구조 변경
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchPostData = async () => {
        try {
          const post = await getPost(id);

          setTitle(post.title || "");
          setContent(post.content || "");
          setDate(post.date || todayString());
          setTime(post.time || "");
          setPlace(post.place || "");
          setCapacity(post.capacity || 2);
          setStatus(post.status || "모집중");
          setCategories(post.categories || {});

          // 🔥 기존 이미지 처리
          if (post.image) {
            setExistingImage(post.image);
            setImage({ preview: post.image });
          }
        } catch (err) {
          console.error(err);
          toast.error("불러오기 실패");
          navigate("/");
        } finally {
          setIsLoading(false);
        }
      };

      fetchPostData();
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목/내용 입력 ㄱ");
      return;
    }

    // 🔥 FormData
    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("date", date);
    formData.append("time", time);
    formData.append("place", place.trim());
    formData.append("capacity", capacity);
    formData.append("status", status);
    formData.append("author", name || "익명");
    formData.append("categories", JSON.stringify(categories));

    // 🔥 이미지 처리 핵심
    if (image?.file) {
      formData.append("image", image.file);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    } else {
      // 🔥 이미지 삭제 의도 전달
      formData.append("existingImage", "");
    }

    try {
      if (isEdit) {
        await updatePost(id, formData);
        toast.success("수정 완료");
      } else {
        await createPost(formData);
        toast.success("등록 완료");
      }

      navigate(isEdit ? `/detail/${id}` : "/");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 413) {
        toast.error("이미지 용량 초과 (5MB)");
      } else {
        toast.error("서버 오류 발생");
      }
    }
  };

  if (isLoading) {
    return <div className={styles.container}>로딩중...</div>;
  }

  return (
    <main className={styles.container}>
      <h2 className={styles.pageTitle}>
        {isEdit ? "게시글 수정" : "게시글 작성"}
      </h2>

      <div className={styles.writeForm}>
        <input
          className={styles.formInput}
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={styles.formTextarea}
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <CategorySelector selected={categories} onChange={setCategories} />

        {/* 🔥 핵심 */}
        <ImageDropZone
          value={image}
          onChange={(val) => {
            if (!val) {
              setImage(null);
              setExistingImage("");
            } else {
              setImage(val);
            }
          }}
        />

        <button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? "수정" : "등록"}
        </button>
      </div>
    </main>
  );
}
