import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, user }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages">
      {messages.map((m, i) => {
        const isMe =
          (m.user_id && Number(m.user_id) === Number(user.id)) ||
          m.nickname === user.nickname;

        const time = m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        return (
          <MessageItem
            key={m.id || i}
            message={m}
            user={user}
            isMe={isMe}
            time={time}
          />
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageList;
