import React from "react";

const ChatHeader = ({ roomId, nickname, host, onDelete, canDelete = false }) => {
  return (
    <div className="chat-header">
      <div>
        <h3 style={{ margin: 0 }}>방 번호: {roomId}</h3>
        {host && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-active)",
              fontWeight: "bold",
            }}
          >
            방장: {host}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#666" }}>
          {nickname}님 접속 중
        </span>
        {canDelete && (
          <button
            onClick={onDelete}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "7px 12px",
              cursor: "pointer",
              color: "#d9363e",
              backgroundColor: "#f2f2f2",
              fontWeight: 600,
            }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
