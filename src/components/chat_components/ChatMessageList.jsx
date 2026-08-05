import ChatMessageItem from "./ChatMessageItem";

const ChatMessageList = ({
  messages,
  userId,
  messagesRef,
  bottomRef,
  onScroll,
  reactions = ["👍", "❤️", "😂"],
  ...messageActions
}) => (
  <div className={"[flex:1] [overflow-y:auto] [overflow-x:hidden] [padding:16px_0_8px] [display:flex] [flex-direction:column] [background:var(--color-bg)]"} ref={messagesRef} onScroll={onScroll}>
    {messages.map((msg, idx) => (
      <ChatMessageItem
        key={msg.id || idx}
        msg={msg}
        idx={idx}
        messages={messages}
        userId={userId}
        variant="dm"
        reactions={reactions}
        {...messageActions}
      />
    ))}
    <div ref={bottomRef} />
  </div>
);

export default ChatMessageList;
