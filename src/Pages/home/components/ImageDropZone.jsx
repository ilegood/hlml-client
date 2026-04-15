import { useRef, useState } from "react";
import { fileToBase64 } from "../constants";

export default function ImageDropZone({ value, onChange, small = false }) {
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const b64 = await fileToBase64(file);
      onChange(b64);
    } else if (file) {
      alert("이미지 파일만 업로드 가능합니다.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`drop-zone${small ? " drop-zone-sm" : ""}${isDragging ? " drag-over" : ""}${value ? " has-img" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
      style={value ? { padding: 0, border: "none" } : {}}
    >
      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      
      {value ? (
        <div className="image-preview">
          <img src={value} alt="preview" />
          <button
            className="remove-img-btn"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: "4px" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div className="drop-zone-text">{small ? "이미지 변경" : "이미지 추가"}</div>
          <div className="drop-zone-sub">클릭하거나 이미지를 드래그하여 놓으세요</div>
        </>
      )}
    </div>
  );
}
