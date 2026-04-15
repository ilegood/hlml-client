import { useRef, useState } from "react";
import styled from "styled-components";
import { fileToBase64 } from "../../pages/homeConstants";

const DropZoneContainer = styled.div`
  width: 100%;
  min-height: 140px;
  background: var(--color-input-bg);
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  padding: 20px;

  &:hover {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }

  &.drag-over {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
    transform: scale(1.01);
  }

  &.has-img {
    padding: 0;
    border: none;
  }

  &.drop-zone-sm {
    min-height: 80px;
    padding: 10px;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const DropZoneText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2px;
`;

const DropZoneSub = styled.div`
  font-size: 11px;
  color: var(--color-deactive);
  text-align: center;
`;

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
    <DropZoneContainer
      className={`${small ? "drop-zone-sm" : ""}${isDragging ? " drag-over" : ""}${value ? " has-img" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      
      {value ? (
        <ImagePreview>
          <img src={value} alt="preview" />
          <RemoveBtn
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            ✕
          </RemoveBtn>
        </ImagePreview>
      ) : (
        <>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: "4px" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <DropZoneText>{small ? "이미지 변경" : "이미지 추가"}</DropZoneText>
          <DropZoneSub>클릭하거나 이미지를 드래그하여 놓으세요</DropZoneSub>
        </>
      )}
    </DropZoneContainer>
  );
}
