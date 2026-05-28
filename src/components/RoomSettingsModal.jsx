import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { STATUS_CLOSED, STATUS_OPEN } from "../api/homeConstants";
import { getPost, updatePost } from "../api/posts";
import CategorySelector from "./post_components/CategorySelector";
import ImageDropZone from "./post_components/ImageDropZone";
import MapPreview from "./post_components/MapPreview";
import PlaceSearchModal from "./modals/PlaceSearchModal";
import styles from "./RoomSettingsModal.module.css";

const CATEGORY_EXCLUDES = ["인원"];

export default function RoomSettingsModal({ roomId, onClose, onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [capacity, setCapacity] = useState(2);
  const [currentParticipants, setCurrentParticipants] = useState(1);
  const [status, setStatus] = useState(STATUS_OPEN);
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const minCapacity = useMemo(
    () => Math.max(2, Number(currentParticipants) || 1),
    [currentParticipants],
  );
  const isAtCapacity = Number(capacity) <= Number(currentParticipants);

  useEffect(() => {
    if (isAtCapacity && status !== STATUS_CLOSED) {
      setStatus(STATUS_CLOSED);
    }
  }, [isAtCapacity, status]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const post = await getPost(roomId);
        setTitle(post.title || "");
        setContent(post.content || "");
        setDate(post.date ? String(post.date).slice(0, 10) : "");
        setTime(post.time ? String(post.time).slice(0, 5) : "");
        setPlace(post.place || "");
        setLatitude(post.latitude || null);
        setLongitude(post.longitude || null);
        setCurrentParticipants(post.participants || 1);
        setCapacity(Math.max(post.capacity || 2, post.participants || 1));
        setStatus(post.status || STATUS_OPEN);
        setCategories(post.categories || {});

        if (post.image) {
          setExistingImage(post.image);
          setImage({ preview: post.image });
        }
      } catch (err) {
        console.error("Failed to load room data:", err);
        toast.error("방 정보를 불러오지 못했습니다.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchRoomData();
  }, [roomId, onClose]);

  const handlePlaceSelect = (item) => {
    setPlace(item.place_name);
    setLatitude(Number(item.y));
    setLongitude(Number(item.x));
    setIsSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    if (capacity < minCapacity) {
      toast.error(`현재 참여 인원(${currentParticipants}명)보다 적게 설정할 수 없습니다.`);
      setCapacity(minCapacity);
      return;
    }

    const nextStatus = isAtCapacity ? STATUS_CLOSED : status;
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("date", date);
    formData.append("time", time);
    formData.append("place", place.trim());
    formData.append("latitude", latitude || "");
    formData.append("longitude", longitude || "");
    formData.append("capacity", capacity);
    formData.append("status", nextStatus);
    formData.append("categories", JSON.stringify(categories));

    if (image?.file) {
      formData.append("image", image.file);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    } else {
      formData.append("existingImage", "");
    }

    try {
      setIsSaving(true);
      const result = await updatePost(roomId, formData);
      toast.success("방 설정을 저장했습니다.");
      onUpdate?.(result?.post);
      onClose();
    } catch (err) {
      console.error("Failed to update room:", err);
      toast.error(err.response?.data?.message || "방 설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>방 설정 변경</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목</label>
            <input
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <textarea
              className={styles.formTextarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="방 설명을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>약속 장소</label>
            <div className={styles.inputWithBtn}>
              <input
                className={styles.formInput}
                value={place}
                readOnly
                placeholder="지도에서 장소를 선택하세요"
              />
              <button
                type="button"
                className={styles.searchBtn}
                onClick={() => setIsSearchOpen(true)}
              >
                지도에서 찾기
              </button>
            </div>
            {latitude && longitude && (
              <div className={styles.mapPreviewSection}>
                <MapPreview latitude={latitude} longitude={longitude} />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>카테고리</label>
            <CategorySelector
              selected={categories}
              onChange={setCategories}
              exclude={CATEGORY_EXCLUDES}
            />
          </div>

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
              <label className={styles.formLabel}>
                인원 수 (현재 {currentParticipants}명)
              </label>
              <div className={styles.capacityRow}>
                <button
                  type="button"
                  className={styles.capBtn}
                  onClick={() => setCapacity((value) => Math.max(minCapacity, value - 1))}
                  disabled={capacity <= minCapacity}
                >
                  -
                </button>
                <span>{capacity}명</span>
                <button
                  type="button"
                  className={styles.capBtn}
                  onClick={() => setCapacity((value) => Math.min(10, value + 1))}
                  disabled={capacity >= 10}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상태</label>
              <select
                className={styles.formSelect}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value={STATUS_OPEN} disabled={isAtCapacity}>
                  모집중
                </option>
                <option value={STATUS_CLOSED}>모집완료</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            className={`${styles.submitBtn} ${isSaving ? styles.savingBtn : ""}`}
            onClick={handleSubmit}
            disabled={isSaving}
            data-saving-label={image?.file ? "이미지 업로드 중..." : "저장 중..."}
          >
            저장하기
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={handlePlaceSelect}
        />
      )}
    </div>
  );
}
