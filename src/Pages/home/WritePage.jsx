import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNickname, todayString } from "./constants";
import { createPost } from "../../api/post";
import CategorySelector from "./components/CategorySelector";
import ImageDropZone from "./components/ImageDropZone";
import "./App.css";

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
        author: getNickname(),
      });
      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("게시글 저장에 실패했습니다.");
    }
  };

  return (
    <main className="container write-container">
      {/* 뒤로가기 헤더 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginRight: "10px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "800" }}>게시글 작성</h2>
      </div>

      <div className="write-form">
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            className="form-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            placeholder="어떤 활동을 함께 하고 싶나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">📅 약속 날짜</label>
            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">⏰ 약속 시간</label>
            <input className="form-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">📍 약속 장소</label>
          <input
            className="form-input"
            placeholder="장소 이름 또는 주소 (선택)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">👥 모집 인원</label>
          <div className="capacity-row">
            <button className="cap-btn" onClick={() => setCapacity((c) => Math.max(1, c - 1))}>−</button>
            <span className="cap-display">{capacity}명</span>
            <button className="cap-btn" onClick={() => setCapacity((c) => Math.min(99, c + 1))}>＋</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">카테고리</label>
          <CategorySelector selected={categories} onChange={setCategories} />
        </div>

        <div className="form-group">
          <label className="form-label">이미지 (선택)</label>
          <ImageDropZone value={image} onChange={setImage} />
        </div>

        <button className="submit-btn" onClick={handleSubmit}>등록하기</button>
      </div>
    </main>
  );
}
