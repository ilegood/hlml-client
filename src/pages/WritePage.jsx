import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { todayString } from "../api/homeConstants";
import { createPost, getPost, updatePost } from "../api/posts";
import CategorySelector from "../components/CategorySelector";
import ImageDropZone from "../components/ImageDropZone";
import MapPreview from "../components/MapPreview";
import PlaceSearchModal from "../components/PlaceSearchModal";

// ── Styled Components ─────────────────────────────────────
const Container = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  padding-top: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  margin-right: 10px;
  transition: background 0.15s;

  &:hover {
    background: var(--color-border);
  }
`;

const PageTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
`;

const WriteForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--color-sidebar);
  padding: 24px;
  border-radius: 18px;
  border: 1.5px solid var(--color-border);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
  opacity: 0.8;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-input-bg);
  color: var(--color-text);
  outline: none;
  transition: all 0.2s;

  &:focus:not(:disabled) {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-bg);
  }
`;

const InputWithBtn = styled.div`
  display: flex;
  gap: 8px;
`;

const SearchBtn = styled.button`
  flex-shrink: 0;
  padding: 0 16px;
  background: var(--color-active);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-input-bg);
  color: var(--color-text);
  resize: vertical;
  min-height: 150px;
  outline: none;
  line-height: 1.6;

  &:focus {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }
`;

const FormRow2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CapacityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CapBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid var(--color-border);
  background: var(--color-input-bg);
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
    color: var(--color-active);
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`;

const CapDisplay = styled.span`
  font-size: 18px;
  font-weight: 800;
  min-width: 50px;
  text-align: center;
  color: var(--color-text);
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: var(--color-active);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(253, 147, 25, 0.2);

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// ── Main Page Component ───────────────────────────────────
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
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState("모집중");
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState("");
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchPostData = async () => {
        try {
          const post = await getPost(id);
          if (post) {
            setTitle(post.title || "");
            setContent(post.content || "");
            setDate(post.date || todayString());
            setTime(post.time || "");
            setPlace(post.place || "");
            setLatitude(post.latitude || null);
            setLongitude(post.longitude || null);
            setCapacity(post.capacity || 2);
            setStatus(post.status || "모집중");
            setCategories(post.categories || {});
            setImage(post.image || "");
          } else {
            alert("게시글을 찾을 수 없습니다.");
            navigate("/");
          }
        } catch (err) {
          console.error("Failed to load post:", err);
          alert("데이터를 불러오는 중 오류가 발생했습니다.");
          navigate("/");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPostData();
    }
  }, [id, isEdit, navigate]);

  const handleSearchPlace = () => {
    setIsSearchOpen(true);
  };

  const handlePlaceSelect = (item) => {
    setPlace(item.place_name);
    setLatitude(item.y);
    setLongitude(item.x);
    setIsSearchOpen(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      date,
      time,
      place: place.trim(),
      latitude,
      longitude,
      capacity,
      categories,
      image,
      status,
      author: name || "익명",
    };
    if (capacity < 2 || capacity > 10) {
      alert("모집 인원은 2명에서 10명 사이여야 합니다.");
      return;
    }

    try {
      if (isEdit) {
        await updatePost(id, { ...postData, edited: true });
        toast.success("게시글이 수정되었습니다.");
      } else {
        await createPost(postData);
        toast.success("게시글이 등록되었습니다.");
      }
      navigate(isEdit ? `/detail/${id}` : "/");
    } catch (err) {
      console.error("Failed to save post:", err);
      toast.error("저장에 실패했습니다.");
    }
  };

  if (isLoading)
    return (
      <Container>
        <PageTitle>불러오는 중...</PageTitle>
      </Container>
    );

  return (
    <Container>
      <Header>
        <BackBtn onClick={() => navigate(-1)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </BackBtn>
        <PageTitle>{isEdit ? "게시글 수정" : "게시글 작성"}</PageTitle>
      </Header>

      <WriteForm>
        <FormGroup>
          <FormLabel>제목</FormLabel>
          <FormInput
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>내용</FormLabel>
          <FormTextarea
            placeholder="어떤 활동을 함께 하고 싶나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormGroup>

        <FormRow2>
          <FormGroup>
            <FormLabel>📅 약속 날짜 {isEdit && "(수정 불가)"}</FormLabel>
            <FormInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isEdit}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>⏰ 약속 시간 {isEdit && "(수정 불가)"}</FormLabel>
            <FormInput
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isEdit}
            />
          </FormGroup>
        </FormRow2>

        <FormGroup>
          <FormLabel>📍 약속 장소</FormLabel>
          <InputWithBtn>
            <FormInput
              placeholder="장소 이름 또는 주소 (선택)"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              readOnly
            />
            <SearchBtn onClick={handleSearchPlace}>지도에서 찾기</SearchBtn>
          </InputWithBtn>

          {/* 위도, 경도 값이 있을 때만 지도 미리보기 출력 */}
          {latitude && longitude && (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <MapPreview latitude={latitude} longitude={longitude} />
              <p style={{ fontSize: "12px", color: "#888" }}>
                선택된 장소의 위치입니다.
              </p>
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <FormLabel>👥 모집 인원 (2~10명) {isEdit && "(수정 불가)"}</FormLabel>
          <CapacityRow>
            <CapBtn
              onClick={() => setCapacity((c) => Math.max(2, c - 1))}
              disabled={isEdit || capacity <= 2}
            >
              −
            </CapBtn>
            <CapDisplay>{capacity}명</CapDisplay>
            <CapBtn
              onClick={() => setCapacity((c) => Math.min(10, c + 1))}
              disabled={isEdit || capacity >= 10}
            >
              ＋
            </CapBtn>
          </CapacityRow>
        </FormGroup>

        <FormGroup>
          <FormLabel>카테고리</FormLabel>
          <CategorySelector selected={categories} onChange={setCategories} />
        </FormGroup>

        <FormGroup>
          <FormLabel>이미지 (선택)</FormLabel>
          <ImageDropZone value={image} onChange={setImage} />
        </FormGroup>

        <SubmitBtn onClick={handleSubmit}>
          {isEdit ? "수정 완료" : "등록하기"}
        </SubmitBtn>
      </WriteForm>

      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={handlePlaceSelect}
        />
      )}
    </Container>
  );
}
