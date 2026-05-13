import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getPost, updatePost } from "../api/posts";
import CategorySelector from "./post_components/CategorySelector";
import ImageDropZone from "./post_components/ImageDropZone";
import styles from "./RoomSettingsModal.module.css";

const CATEGORY_EXCLUDES = ["인원"];

export default function RoomSettingsModal({ roomId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState("모집중");
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const post = await getPost(roomId);
        setTitle(post.title || "");
        setContent(post.content || "");
        setDate(post.date ? String(post.date).slice(0, 10) : "");
        setTime(post.time ? String(post.time).slice(0, 5) : "");
        setPlace(post.place || "");
        setCapacity(post.capacity || 2);
        setStatus(post.status || "모집중");
        setCategories(post.categories || {});
        
        if (post.image) {
          setExistingImage(post.image);
          setImage({ preview: post.image });
        }
      } catch (err) {
        console.error("Failed to load room data:", err);
        toast.error("방 정보를 불러오는 데 실패했습니다.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, onClose]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("date", date);
    formData.append("time", time);
    formData.append("place", place.trim());
    formData.append("capacity", capacity);
    formData.append("status", status);
    formData.append("categories", JSON.stringify(categories));

    if (image?.file) {
      formData.append("image", image.file);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    } else {
      formData.append("existingImage", "");
    }

    try {
      await updatePost(roomId, formData);
      toast.success("방 설정이 수정되었습니다.");
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error("Failed to update room:", err);
      toast.error("수정에 실패했습니다.");
    }
  };

  if (loading) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>방 설정 변경</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.scrollArea}>
          {/* 제목 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목</label>
            <input
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <textarea
              className={styles.formTextarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="방 설명을 입력하세요"
            />
          </div>

          {/* 장소 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>약속 장소</label>
            <input
              className={styles.formInput}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="장소 이름 또는 주소"
            />
          </div>

          {/* 카테고리 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>카테고리</label>
            <CategorySelector
              selected={categories}
              onChange={setCategories}
              exclude={CATEGORY_EXCLUDES}
            />
          </div>

          {/* 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이미지</label>
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
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>인원 수</label>
              <div className={styles.capacityRow}>
                <button 
                  className={styles.capBtn} 
                  onClick={() => setCapacity(c => Math.max(2, c - 1))}
                >-</button>
                <span>{capacity}명</span>
                <button 
                  className={styles.capBtn} 
                  onClick={() => setCapacity(c => Math.min(10, c + 1))}
                >+</button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상태</label>
              <select 
                className={styles.formSelect}
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="모집중">모집중</option>
                <option value="모집완료">모집완료</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>저장하기</button>
        </div>
      </div>
    </div>
  );
}
