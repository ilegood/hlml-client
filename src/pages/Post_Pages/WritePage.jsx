import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { STATUS_OPEN, currentTimeString, todayString } from "../../api/homeConstants";
import { useAuth } from "../../context/auth";
import { createPost, getPost, updatePost } from "../../api/posts";
import CategorySelector from "../../components/post_components/CategorySelector";
import ImageDropZone from "../../components/post_components/ImageDropZone";
import MapPreview from "../../components/post_components/MapPreview";
import PlaceSearchModal from "../../components/modals/PlaceSearchModal";
import styles from "./WritePage.module.css";

const WRITE_CATEGORY_EXCLUDES = ["인원"];

export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState(() => currentTimeString());
  const [place, setPlace] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState(STATUS_OPEN);
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);
  const today = todayString();
  const currentTime = currentTimeString();

  useEffect(() => {
    if (!isEdit) return;

    const fetchPostData = async () => {
      try {
        const post = await getPost(id);
        setTitle(post.title || "");
        setContent(post.content || "");
        setDate(post.date ? String(post.date).slice(0, 10) : todayString());
        setTime(post.time ? String(post.time).slice(0, 5) : "");
        setPlace(post.place || "");
        setLatitude(post.latitude || null);
        setLongitude(post.longitude || null);
        setCapacity(post.capacity || 2);
        setStatus(post.status || STATUS_OPEN);
        setCategories(post.categories || {});

        if (post.image) {
          setExistingImage(post.image);
          setImage({ preview: post.image });
        } else {
          setExistingImage("");
          setImage(null);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        toast.error("게시글을 불러오지 못했습니다.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [id, isEdit, navigate]);

  const handlePlaceSelect = (item) => {
    setPlace(item.place_name);
    setLatitude(Number(item.y));
    setLongitude(Number(item.x));
    setIsSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    if (date < today) {
      toast.error("오늘 이전 날짜는 선택할 수 없습니다.");
      setDate(today);
      return;
    }

    if (date === today && time < currentTime) {
      toast.error("현재 시간 이전은 선택할 수 없습니다.");
      setTime(currentTime);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("date", date);
    formData.append("time", time);
    formData.append("place", place.trim());
    formData.append("latitude", latitude || "");
    formData.append("longitude", longitude || "");
    formData.append("capacity", capacity);
    formData.append("status", status);
    formData.append("user_id", userId);
    formData.append("categories", JSON.stringify(categories));

    if (image?.file) {
      formData.append("image", image.file);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    } else {
      formData.append("existingImage", "");
    }

    try {
      if (isEdit) {
        await updatePost(id, formData);
        toast.success("게시글을 수정했습니다.");
        navigate(`/detail/${id}`);
      } else {
        const result = await createPost(formData);
        toast.success("게시글을 등록했습니다.");
        navigate(result?.id ? `/chat-rooms/${result.id}` : "/");
      }
    } catch (err) {
      console.error("Failed to save post:", err);
      toast.error(err.response?.data?.message || "저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <main className={styles.container}>
        <h2 className={styles.pageTitle}>불러오는 중...</h2>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className={styles.pageTitle}>
          {isEdit ? "게시글 수정" : "게시글 작성"}
        </h2>
      </div>

      <div className={styles.writeForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>제목</label>
          <input
            className={styles.formInput}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>내용</label>
          <textarea
            className={styles.formTextarea}
            placeholder="어떤 활동을 함께 하고 싶나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={styles.formRow2}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              약속 날짜 {isEdit && "(수정 불가)"}
            </label>
            <input
              className={styles.formInput}
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isEdit}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              약속 시간 {isEdit && "(수정 불가)"}
            </label>
            <input
              className={styles.formInput}
              type="time"
              min={!isEdit && date === today ? currentTime : undefined}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isEdit}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>약속 장소</label>
          <div className={styles.inputWithBtn}>
            <input
              className={styles.formInput}
              placeholder="장소 이름 또는 주소"
              value={place}
              readOnly
            />
            <button className={styles.searchBtn} onClick={() => setIsSearchOpen(true)}>
              지도에서 찾기
            </button>
          </div>

          {latitude && longitude && (
            <div className={styles.mapPreviewSection}>
              <MapPreview latitude={latitude} longitude={longitude} />
              <p className={styles.mapHint}>선택한 장소의 위치입니다.</p>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            모집 인원 (2~10명) {isEdit && "(수정 불가)"}
          </label>
          <div className={styles.capacityRow}>
            <button
              type="button"
              className={styles.capBtn}
              onClick={() => setCapacity((value) => Math.max(2, value - 1))}
              disabled={isEdit || capacity <= 2}
            >
              -
            </button>
            <span className={styles.capDisplay}>{capacity}명</span>
            <button
              type="button"
              className={styles.capBtn}
              onClick={() => setCapacity((value) => Math.min(10, value + 1))}
              disabled={isEdit || capacity >= 10}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>카테고리</label>
          <CategorySelector
            selected={categories}
            onChange={setCategories}
            exclude={WRITE_CATEGORY_EXCLUDES}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>이미지 (선택)</label>
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

        <button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? "수정 완료" : "등록하기"}
        </button>
      </div>

      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={handlePlaceSelect}
        />
      )}
    </main>
  );
}
