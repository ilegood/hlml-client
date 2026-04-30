import React from "react";

const MessageItem = ({ message, user, isMe, time }) => {
  if (message.isSystem || message.is_system) {
    return (
      <div className="system-message">
        {message.message}
      </div>
    );
  }

  return (
    <div className={`message-wrapper ${isMe ? "sent" : "received"}`}>
      {!isMe && <span className="nickname">{message.nickname}</span>}
      {message.image && (
        <img src={message.image} alt="chat" className="chat-image" />
      )}
      <div className="message">{message.message}</div>
      <span className="time">{time}</span>
    </div>
  );
};

export default MessageItem;
