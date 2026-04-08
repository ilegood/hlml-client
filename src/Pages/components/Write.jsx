import { useState } from "react";
import CategoryFilter from "./CategoryFilter";

export default function Write({ onAdd }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState({});

  return (
    <div>
      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <CategoryFilter selected={categories} setSelected={setCategories} />

      <button
        style={{ marginTop: 10 }}
        onClick={() => {
          if (!title || !content) {
            alert("입력해라");
            return;
          }

          onAdd({
            id: Date.now(),
            title,
            content,
            categories,
          });
        }}
      >
        등록
      </button>
    </div>
  );
}
