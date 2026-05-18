import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import styles from "./ImageDropZone.module.css";

export default function ImageDropZone({ value, onChange, small = false }) {
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("5MB 이하만 가능합니다.");
      return;
    }

    // 🔥 기존 preview 해제
    if (value?.preview) {
      URL.revokeObjectURL(value.preview);
    }

    const preview = URL.createObjectURL(file);

    onChange({
      file,
      preview,
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // 🔥 컴포넌트 unmount 시 정리
  useEffect(() => {
    return () => {
      if (value?.preview) {
        URL.revokeObjectURL(value.preview);
      }
    };
  }, [value]);

  return (
    <div
      className={`${styles.container} 
      ${small ? styles.small : ""} 
      ${isDragging ? styles.drag : ""} 
      ${value ? styles.hasImg : ""}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {value?.preview ? (
        <div className={styles.preview}>
          <img src={value.preview} alt="preview" />
          <button
            className={styles.remove}
            onClick={(e) => {
              e.stopPropagation();

              // 🔥 삭제 시도 해제
              URL.revokeObjectURL(value.preview);

              onChange(null);
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className={styles.icon}>📷</div>
          <div className={styles.text}>
            {small ? "이미지 변경" : "이미지 추가"}
          </div>
          <div className={styles.sub}>클릭 or 드래그</div>
        </>
      )}
    </div>
  );
}
