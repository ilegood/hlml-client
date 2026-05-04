import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/auth";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";

export default function ChatRoomDetailPage() {
  const { roomId } = useParams();
  const { name, userId } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomTitle, setRoomTitle] = useState("");

  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userId || !name) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    socketRef.current = io("http://localhost:4000");
    const socket = socketRef.current;

    socket.emit("join_room", roomId);

    socket.on("load_messages", (rawMessages) => {
      const formatted = rawMessages.map((msg) => ({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        nickname: msg.nickname,
        content: msg.content,
        isSystem: msg.is_system === 1,
        isEdited: msg.is_edited === 1,
        isDeleted: msg.is_deleted === 1,
        parentId: msg.parent_id,
        reactions: msg.reactions || [],
        readCount: msg.readCount || 0,
        time: msg.created_at,
      }));
      setMessages(formatted);

      if (formatted.length > 0) {
        formatted.forEach((m) => {
          if (!m.isSystem && String(m.userId) !== String(userId)) {
            socket.emit("mark_read", { messageId: m.id, userId, roomId });
          }
        });
      }
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          isEdited: msg.is_edited === 1,
          isDeleted: msg.is_deleted === 1,
          time: msg.created_at || new Date().toISOString(),
        },
      ]);

      if (!msg.isSystem && String(msg.userId) !== String(userId)) {
        socket.emit("mark_read", { messageId: msg.id, userId, roomId });
      }
    });

    socket.on("message_edited", ({ messageId, content }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content, isEdited: true } : m,
        ),
      );
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, content: "삭제된 메시지입니다." }
            : m,
        ),
      );
      // 수정 중인 메시지가 삭제된 경우 수정 상태 해제
      setEditId((prev) => {
        if (prev === messageId) {
          setInput("");
          return null;
        }
        return prev;
      });
    });

    socket.on("update_reactions", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
      );
    });

    socket.on("update_read_count", ({ messageId, readCount }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, readCount } : m)),
      );
    });

    return () => socket.disconnect();
  }, [roomId, userId, name, navigate]);

  useEffect(() => {
    const handleClickOutside = () => setShowEmojiPicker(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    if (editId) {
      socketRef.current.emit("edit_message", {
        messageId: editId,
        content: input,
        roomId,
      });
      setEditId(null);
    } else {
      socketRef.current.emit("send_message", {
        roomId,
        userId,
        nickname: name,
        content: input,
        isSystem: false,
        parentId: replyTo?.id || null,
        time: new Date().toISOString(),
      });
      setReplyTo(null);
    }
    setInput("");
    inputRef.current?.focus();
  };

  const startEdit = (msg) => {
    setEditId(msg.id);
    setInput(msg.content);
    setReplyTo(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const startReply = (msg) => {
    setReplyTo(msg);
    setEditId(null);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleDelete = (msgId) => {
    if (window.confirm("메시지를 삭제하시겠습니까?")) {
      socketRef.current.emit("delete_message", { messageId: msgId, roomId });
      // 현재 수정 중인 메시지를 삭제하는 경우 수정 상태 해제
      if (editId === msgId) {
        setEditId(null);
        setInput("");
      }
    }
  };

  const toggleReaction = (msgId, emoji) => {
    socketRef.current.emit("react_message", {
      messageId: msgId,
      userId,
      emoji,
      roomId,
    });
    setShowEmojiPicker(null);
  };

  const getParentMsg = (parentId) => {
    return messages.find((m) => m.id === parentId);
  };

  const scrollToMessage = (msgId) => {
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add(styles.highlight);
      setTimeout(() => {
        element.classList.remove(styles.highlight);
      }, 2000);
    } else {
      toast.error("원본 메시지를 찾을 수 없습니다.");
    }
  };

  return (
    <div className={styles.chatWrap}>
      <div className={styles.header}>
        <div className={styles.headerAvatar}></div>
        <div className={styles.headerInfo}>
          <div className={styles.headerName}>채팅방 #{roomId}</div>
          <div className={styles.headerStatus}>
            <span className={styles.statusDot} />
            접속 중
          </div>
        </div>
        <button className={styles.backBtn}>채팅 알림 설정</button>
        <button className={styles.backBtn}>지도보기</button>
        <button className={styles.backBtn}>멤버보기</button>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/chat-rooms")}
        >
          나가기
        </button>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, idx) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id || idx} className={styles.systemMsg}>
                {msg.content}
              </div>
            );
          }

          const isMine = String(msg.userId) === String(userId);
          const parentMsg = msg.parentId ? getParentMsg(msg.parentId) : null;

          return (
            <div
              key={msg.id || idx}
              id={`msg-${msg.id}`}
              className={`${styles.msgRow} ${isMine ? styles.msgRowMine : ""}`}
            >
              {!isMine && (
                <div className={styles.msgAvatar}>
                  {msg.nickname?.slice(0, 2)}
                </div>
              )}

              <div
                className={`${styles.msgBlock} ${isMine ? styles.msgBlockMine : ""}`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMsgId(null);
                }}
              >
                {!isMine && (
                  <span className={styles.msgNickname}>{msg.nickname}</span>
                )}

                {parentMsg && (
                  <div
                    className={styles.replyPreviewInMsg}
                    onClick={() => scrollToMessage(parentMsg.id)}
                  >
                    <span className={styles.replyName}>
                      @{parentMsg.nickname}에게 답장
                    </span>
                    <div className={styles.replyContent}>
                      {parentMsg.isDeleted
                        ? "삭제된 메시지"
                        : parentMsg.content}
                    </div>
                  </div>
                )}

                <div className={styles.bubbleArea}>
                  {hoveredMsgId === msg.id && !msg.isDeleted && (
                    <div
                      className={`${styles.msgActions} ${isMine ? styles.msgActionsMine : styles.msgActionsOther}`}
                    >
                      {/* 빠른 반응 (디스코드 스타일) */}
                      <div className={styles.quickReactions}>
                        {["👍", "❤️", "😂"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg.id, emoji);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className={styles.actionDivider} />

                      <button
                        type="button"
                        title="반응 추가"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEmojiPicker(msg.id);
                        }}
                      >
                        ➕
                      </button>
                      <button
                        type="button"
                        title="답장"
                        onClick={(e) => {
                          e.stopPropagation();
                          startReply(msg);
                        }}
                      >
                        ↩️
                      </button>
                      {isMine && (
                        <>
                          <button
                            type="button"
                            title="수정"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(msg);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            title="삭제"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg.id);
                            }}
                          >
                            🗑️
                          </button>
                        </>
                      )}

                      {showEmojiPicker === msg.id && (
                        <div
                          className={styles.emojiPicker}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {["👍", "❤️", "😂", "😮", "😢", "🔥"].map((emoji) => (
                            <span
                              key={emoji}
                              onClick={() => toggleReaction(msg.id, emoji)}
                            >
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`${styles.msgBubble} ${isMine ? styles.msgBubbleMine : styles.msgBubbleOther} ${msg.isDeleted ? styles.deleted : ""}`}
                  >
                    {msg.content}
                    {msg.isEdited && !msg.isDeleted && (
                      <span className={styles.editedTag}>(수정됨)</span>
                    )}
                  </div>
                </div>

                {msg.reactions?.length > 0 && (
                  <div className={styles.reactionsArea}>
                    {Object.entries(
                      msg.reactions.reduce((acc, curr) => {
                        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                        return acc;
                      }, {}),
                    ).map(([emoji, count]) => {
                      const isMyReaction = msg.reactions.some(
                        (r) =>
                          r.emoji === emoji &&
                          String(r.user_id) === String(userId),
                      );
                      return (
                        <div
                          key={emoji}
                          className={`${styles.reactionBadge} ${isMyReaction ? styles.activeReaction : ""}`}
                          onClick={() => toggleReaction(msg.id, emoji)}
                        >
                          {emoji} {count}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.msgMeta}>
                  <span className={styles.msgTime}>{formatTime(msg.time)}</span>
                  {isMine && msg.readCount > 0 && (
                    <span className={styles.readCount}>
                      {msg.readCount} 읽음
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {(replyTo || editId) && (
        <div className={styles.inputContext}>
          <div className={styles.contextInfo}>
            {replyTo ? (
              <>
                <span>@{replyTo.nickname}님에게 답장 중</span>
                <p>{replyTo.content}</p>
              </>
            ) : (
              <>
                <span>메시지 수정 중</span>
                <p>{messages.find((m) => m.id === editId)?.content}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setReplyTo(null);
              setEditId(null);
              setInput("");
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={editId ? "메시지 수정..." : "메시지를 입력하세요..."}
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={(e) => handleSend(e)}
        >
          <svg
            style={{ pointerEvents: "none" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
