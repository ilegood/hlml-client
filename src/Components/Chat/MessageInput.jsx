import React from "react";

const MessageInput = ({
  input,
  setInput,
  handleSend,
  fileInputRef,
  onFileChange,
  disabled = false,
}) => {
  return (
    <div className="input-area">
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={onFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={disabled}
        style={{ padding: "0 15px", background: "#f0f0f0", color: "#333" }}
      >
        +
      </button>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
        placeholder="메시지를 입력하세요..."
      />
      <button onClick={handleSend} disabled={disabled}>
        보내기
      </button>
    </div>
  );
};

export default MessageInput;
