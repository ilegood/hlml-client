import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { todayString } from "../api/homeConstants";
import { createPost } from "../api/posts";
import CategorySelector from "../components/CategorySelector";
import ImageDropZone from "../components/ImageDropZone";

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

  &:focus {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }
`;

const CapDisplay = styled.span`
  font-size: 16px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
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
  const navigate = useNavigate();
  const { name } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [categories, setCategories] = useState({});
  const [image, setImage] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        date,
        time,
        place: place.trim(),
        capacity,
        categories,
        image,
        author: name || "익명",
      });
      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("게시글 저장에 실패했습니다.");
    }
  };

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
        <PageTitle>게시글 작성</PageTitle>
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
            <FormLabel>📅 약속 날짜</FormLabel>
            <FormInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>⏰ 약속 시간</FormLabel>
            <FormInput
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </FormGroup>
        </FormRow2>

        <FormGroup>
          <FormLabel>📍 약속 장소</FormLabel>
          <FormInput
            placeholder="장소 이름 또는 주소 (선택)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>👥 모집 인원</FormLabel>
          <CapacityRow>
            <CapBtn onClick={() => setCapacity((c) => Math.max(1, c - 1))}>
              −
            </CapBtn>
            <CapDisplay>{capacity}명</CapDisplay>
            <CapBtn onClick={() => setCapacity((c) => Math.min(99, c + 1))}>
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

        <SubmitBtn onClick={handleSubmit}>등록하기</SubmitBtn>
      </WriteForm>
    </Container>
  );
}
