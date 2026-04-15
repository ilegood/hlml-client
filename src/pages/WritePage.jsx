import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { todayString } from "./homeConstants";
import { createPost } from "../api/posts";
import CategorySelector from "../components/home/CategorySelector";
import ImageDropZone from "../components/home/ImageDropZone";

const Container = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-sidebar);
  cursor: pointer;
  margin-right: 15px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: var(--color-sidebar);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin-left: 4px;
`;

const FormInput = styled.input`
  height: 48px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: var(--color-input-bg);
  font-size: 15px;
  color: var(--color-text);
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }
`;

const FormTextarea = styled.textarea`
  min-height: 150px;
  padding: 16px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  background: var(--color-input-bg);
  font-size: 15px;
  color: var(--color-text);
  outline: none;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }
`;

const FormRow2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const CapacityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--color-input-bg);
  border: 1.5px solid var(--color-border);
  width: fit-content;
  padding: 6px 12px;
  border-radius: 10px;
`;

const CapBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    color: var(--color-active);
  }
`;

const CapDisplay = styled.span`
  font-size: 16px;
  font-weight: 800;
  min-width: 40px;
  text-align: center;
`;

const SubmitBtn = styled.button`
  height: 54px;
  background: var(--color-active);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(253, 147, 25, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(253, 147, 25, 0.4);
    opacity: 0.9;
  }
`;

export default function WritePage() {
  const navigate = useNavigate();
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
        author: localStorage.getItem("name") || "익명",
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </BackBtn>
        <PageTitle>새로운 모임 만들기</PageTitle>
      </Header>

      <Form>
        <FormGroup>
          <FormLabel>활동 제목</FormLabel>
          <FormInput
            placeholder="어떤 활동을 하고 싶나요?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>상세 설명</FormLabel>
          <FormTextarea
            placeholder="모임에 대해 자세히 설명해주세요 (일정, 준비물, 주의사항 등)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormGroup>

        <FormRow2>
          <FormGroup>
            <FormLabel>📅 약속 날짜</FormLabel>
            <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <FormLabel>⏰ 약속 시간</FormLabel>
            <FormInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </FormGroup>
        </FormRow2>

        <FormGroup>
          <FormLabel>📍 약속 장소</FormLabel>
          <FormInput
            placeholder="어디서 만나면 좋을까요? (선택)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>👥 모집 인원</FormLabel>
          <CapacityRow>
            <CapBtn onClick={() => setCapacity((c) => Math.max(1, c - 1))}>−</CapBtn>
            <CapDisplay>{capacity}명</CapDisplay>
            <CapBtn onClick={() => setCapacity((c) => Math.min(99, c + 1))}>＋</CapBtn>
          </CapacityRow>
        </FormGroup>

        <FormGroup>
          <FormLabel>카테고리</FormLabel>
          <CategorySelector selected={categories} onChange={setCategories} />
        </FormGroup>

        <FormGroup>
          <FormLabel>이미지 추가 (선택)</FormLabel>
          <ImageDropZone value={image} onChange={setImage} />
        </FormGroup>

        <SubmitBtn onClick={handleSubmit}>모집 시작하기</SubmitBtn>
      </Form>
    </Container>
  );
}
