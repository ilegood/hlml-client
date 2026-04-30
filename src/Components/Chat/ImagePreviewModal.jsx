import React from "react";

const ImagePreviewModal = ({ preview, setPreview, setImage, handleSend }) => {
  if (!preview) return null;

  return (
    <div className="image-preview-modal">
      <h4>이미지 전송 설정</h4>
      <img src={preview} alt="Preview" className="preview-img" />
      <div className="modal-btns">
        <button
          onClick={() => {
            setPreview(null);
            setImage(null);
          }}
          style={{ background: "#ccc", flex: 1 }}
        >
          취소
        </button>
        <button onClick={handleSend} style={{ flex: 1 }}>
          전송하기
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
