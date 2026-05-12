import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/auth";
import { BASE_URL, getImageUrl } from "../api/instance";
import { leavePost, getPost } from "../api/posts";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import RoomSettingsModal from "../Components/RoomSettingsModal";
import ChatMembersModal from "../Components/ChatMembersModal";
import borderImg from "../assets/border.png";

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────
// ... (omitted for brevity, will use full content in actual tool call)

const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "오늘";
  if (d.toDateString() === yesterday.toDateString()) return "어제";
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a),
    db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// 같은 유저가 2분 이내에 연속 작성한 경우 compact 처리
const isCompact = (prev, curr) => {
  if (!prev || prev.isSystem || curr.isSystem) return false;
  if (prev.userId !== curr.userId) return false;
  const diff = new Date(curr.time) - new Date(prev.time);
  return diff < 2 * 60 * 1000;
};

// ── Avatar 컴포넌트 ────────────────────────────────────────────────────────────

function Avatar({ profileImg, nickname, isHost, size = 40 }) {
  const url = getImageUrl(profileImg);
  return (
    <div className={styles.avatarWrapSmall}>
      {isHost && (
        <img
          src={borderImg}
          className={styles.avatarBorderSmall}
          alt="host-border"
        />
      )}
      <div
        className={styles.msgAvatar}
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        {url ? <img src={url} alt={nickname} /> : nickname?.slice(0, 2)}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ChatRoomDetailPage() {
  const { roomId } = useParams();
  const { name, userId, profileImg } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomImage, setRoomImage] = useState("");
  const [roomAuthor, setRoomAuthor] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // ── Socket setup ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !name) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    socketRef.current = io(BASE_URL);
    const socket = socketRef.current;

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

      const isMine = String(msg.userId) === String(userId);
      const container = messagesRef.current;
      const isAtBottom =
        container &&
        container.scrollHeight - container.scrollTop <=
          container.clientHeight + 100;

      if (isMine || isAtBottom) {
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      }
    });

    socket.on("room_info", ({ title, image, author }) => {
      setRoomTitle(title);
      setRoomImage(image);
      setRoomAuthor(author);
    });

    socket.emit("join_room", { roomId, nickname: name, userId });

    socket.on("load_messages", (rawMessages) => {
      const formatted = rawMessages.map((msg) => ({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        nickname: msg.nickname,
        profileImg: msg.profileImg,
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
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "auto" }),
          100,
        );
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

    socket.on("error_message", (msg) => {
      toast.error(msg);
      navigate("/chat-rooms");
    });

    socket.on("user_kicked", ({ targetUserId }) => {
      if (Number(targetUserId) === Number(userId)) {
        toast.error("방장에 의해 강퇴되었습니다.");
        navigate("/chat-rooms");
      }
    });

    return () => socket.disconnect();
  }, [roomId, userId, name, navigate]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowEmojiPicker(null);
      setShowMainEmojiPicker(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEmojiSelect = (emoji) => {
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const text = input;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setInput(before + emoji.native + after);

    // 포커스 유지 및 커서 이동을 위한 처리
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        start + emoji.native.length,
        start + emoji.native.length,
      );
    }, 0);
  };

  // ── Scroll ──────────────────────────────────────────────────────────────────

  const handleScroll = () => {
    const container = messagesRef.current;
    if (!container) return;
    const isUp =
      container.scrollHeight - container.scrollTop >
      container.clientHeight + 200;
    setShowScrollBtn(isUp);
  };

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleSend = useCallback(
    (e) => {
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
          profileImg,
          content: input,
          isSystem: false,
          parentId: replyTo?.id || null,
          time: new Date().toISOString(),
        });
        setReplyTo(null);
      }
      setInput("");
      inputRef.current?.focus();
    },
    [input, editId, replyTo, roomId, userId, name, profileImg],
  );

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
    toast("메시지를 삭제하시겠습니까?", {
      action: {
        label: "삭제",
        onClick: () => {
          socketRef.current.emit("delete_message", {
            messageId: msgId,
            roomId,
          });
          if (editId === msgId) {
            setEditId(null);
            setInput("");
          }
        },
      },
    });
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

  const getParentMsg = (parentId) => messages.find((m) => m.id === parentId);

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add(styles.highlight);
      setTimeout(() => el.classList.remove(styles.highlight), 2000);
    } else {
      toast.error("원본 메시지를 찾을 수 없습니다.");
    }
  };

  const toggleMembers = async () => {
    if (!showMembers) {
      try {
        const post = await getPost(roomId);
        // 방장 포함 멤버 리스트 만들기
        const members = [];
        if (post.authorDetails) {
          members.push(post.authorDetails);
        }
        if (post.participantDetails) {
          members.push(...post.participantDetails);
        }
        setRoomMembers(members);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        toast.error("멤버 정보를 불러오는 데 실패했습니다.");
      }
    }
    setShowMembers(!showMembers);
  };

  const cancelContext = () => {
    setReplyTo(null);
    setEditId(null);
    setInput("");
  };

  const handleLeave = async () => {
    if (!window.confirm("정말로 이 채팅방에서 나가시겠습니까?")) return;

    try {
      // 소켓으로 퇴장 알림 (실시간 반영용)
      socketRef.current?.emit("leave_room", {
        roomId,
        nickname: name,
        userId,
      });

      // API로 DB 정보 업데이트 (인원 감소, 방장 위임, 퇴장 메시지 저장)
      await leavePost(roomId);

      toast.success("채팅방에서 나갔습니다.");
      navigate("/chat-rooms");
    } catch (err) {
      console.error("Failed to leave room:", err);
      toast.error("방 나가기에 실패했습니다.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.chatWrap}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerThumb}>
          {roomImage ? (
            <img src={getImageUrl(roomImage)} alt="room" />
          ) : (
            <span className={styles.headerHashIcon}>#</span>
          )}
        </div>
        <span className={styles.headerName}>
          {roomTitle || `채팅방 ${roomId}`}
        </span>
        <div className={styles.headerDivider} />
        <span className={styles.headerDesc}>
          {roomTitle ? `${roomTitle} 채팅방입니다.` : ""}
        </span>
        <div className={styles.headerActions}>
          {name === roomAuthor && (
            <button
              className={styles.headerIconBtn}
              title="방 설정 변경"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          )}
          <button className={styles.headerIconBtn} title="채팅 알림 설정">
            🔔
          </button>
          <button className={styles.headerIconBtn} title="지도보기">
            🗺️
          </button>
          <button
            className={styles.headerIconBtn}
            title="멤버보기"
            onClick={toggleMembers}
          >
            👥
          </button>
          <button
            className={styles.headerIconBtn}
            title="나가기"
            onClick={handleLeave}
          >
            🚪
          </button>
        </div>
      </div>

      {/* ── Message list ── */}
      <div
        className={styles.messages}
        ref={messagesRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showDateDivider = !isSameDay(prevMsg?.time, msg.time);
          const compact = !showDateDivider && isCompact(prevMsg, msg);
          const isMine = String(msg.userId) === String(userId);
          const parentMsg = msg.parentId ? getParentMsg(msg.parentId) : null;

          // 리액션 집계
          const reactionMap = (msg.reactions || []).reduce((acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
            acc[r.emoji].count++;
            if (String(r.userId || r.user_id) === String(userId))
              acc[r.emoji].mine = true;
            return acc;
          }, {});

          if (msg.isSystem) {
            return (
              <div key={msg.id || idx}>
                {showDateDivider && (
                  <div className={styles.dateDivider}>
                    <span className={styles.dateDividerText}>
                      {formatDate(msg.time)}
                    </span>
                  </div>
                )}
                <div className={styles.systemMsg}>{msg.content}</div>
              </div>
            );
          }

          return (
            <div key={msg.id || idx}>
              {showDateDivider && (
                <div className={styles.dateDivider}>
                  <span className={styles.dateDividerText}>
                    {formatDate(msg.time)}
                  </span>
                </div>
              )}

              <div
                id={`msg-${msg.id}`}
                className={`${styles.msgRow} ${compact ? styles.compact : styles.msgGroupStart}`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                {/* ── Avatar column ── */}
                <div className={styles.msgAvatarWrap}>
                  {compact ? (
                    <span className={styles.compactTime}>
                      {formatTime(msg.time)}
                    </span>
                  ) : (
                    <Avatar
                      profileImg={msg.profileImg}
                      nickname={msg.nickname}
                      isHost={msg.nickname === roomAuthor}
                    />
                  )}
                </div>

                {/* ── Content column ── */}
                <div className={styles.msgContent}>
                  {/* 닉네임 + 시각 (첫 메시지만) */}
                  {!compact && (
                    <div className={styles.msgHeader}>
                      <span
                        className={`${styles.msgNickname} ${isMine ? styles.msgNicknameMine : ""}`}
                      >
                        {msg.nickname}
                      </span>
                      <span className={styles.msgTimestamp}>
                        {formatTime(msg.time)}
                      </span>
                    </div>
                  )}

                  {/* 답장 미리보기 */}
                  {parentMsg && (
                    <div
                      className={styles.replyPreviewInMsg}
                      onClick={() => scrollToMessage(parentMsg.id)}
                    >
                      <div className={styles.replyAvatar}>
                        {parentMsg.profileImg ? (
                          <img
                            src={getImageUrl(parentMsg.profileImg)}
                            alt={parentMsg.nickname}
                          />
                        ) : (
                          parentMsg.nickname?.slice(0, 1)
                        )}
                      </div>
                      <span className={styles.replyName}>
                        {parentMsg.nickname}
                      </span>
                      <span className={styles.replyContent}>
                        {parentMsg.isDeleted
                          ? "삭제된 메시지"
                          : parentMsg.content}
                      </span>
                    </div>
                  )}

                  {/* 메시지 본문 */}
                  <div
                    className={`${styles.msgBubble} ${msg.isDeleted ? styles.deleted : ""}`}
                  >
                    {msg.content}
                    {msg.isEdited && !msg.isDeleted && (
                      <span className={styles.editedTag}>(수정됨)</span>
                    )}
                  </div>

                  {/* 읽음 수 */}
                  {isMine && msg.readCount > 0 && (
                    <div className={styles.readCount}>
                      {msg.readCount}명 읽음
                    </div>
                  )}

                  {/* 리액션 배지 */}
                  {Object.keys(reactionMap).length > 0 && (
                    <div className={styles.reactionsArea}>
                      {Object.entries(reactionMap).map(
                        ([emoji, { count, mine }]) => (
                          <div
                            key={emoji}
                            className={`${styles.reactionBadge} ${mine ? styles.activeReaction : ""}`}
                            onClick={() => toggleReaction(msg.id, emoji)}
                          >
                            {emoji}
                            <span className={styles.reactionCount}>
                              {count}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* ── Action toolbar (항상 오른쪽 끝) ── */}
                {hoveredMsgId === msg.id && !msg.isDeleted && (
                  <div
                    className={styles.msgActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 빠른 반응 */}
                    <div className={styles.quickReactions}>
                      {["👍", "❤️", "😂"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          title={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className={styles.actionDivider} />

                    {/* 반응 더 추가 */}
                    <button
                      type="button"
                      title="반응 추가"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker(msg.id);
                      }}
                      style={{ position: "relative" }}
                    >
                      😊
                      {showEmojiPicker === msg.id && (
                        <div
                          className={styles.emojiPickerPopup}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Picker
                            data={data}
                            onEmojiSelect={(emoji) =>
                              toggleReaction(msg.id, emoji.native)
                            }
                            theme="dark"
                            locale="ko"
                          />
                        </div>
                      )}
                    </button>

                    {/* 답장 */}
                    <button
                      type="button"
                      title="답장"
                      onClick={() => startReply(msg)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>

                    {isMine && (
                      <>
                        {/* 수정 */}
                        <button
                          type="button"
                          title="수정"
                          onClick={() => startEdit(msg)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* 삭제 */}
                        <button
                          type="button"
                          title="삭제"
                          onClick={() => handleDelete(msg.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Scroll to bottom button ── */}
      {showScrollBtn && (
        <button
          className={styles.scrollToBottom}
          onClick={scrollToBottom}
          title="최신 메시지 보기"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* ── Reply / Edit context bar ── */}
      {(replyTo || editId) && (
        <div className={styles.inputContext}>
          <div>
            <div className={styles.contextLabel}>
              {replyTo ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  {replyTo.nickname}님에게 답장 중
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  메시지 수정 중
                </>
              )}
            </div>
            <div className={styles.contextText}>
              {replyTo
                ? replyTo.content
                : messages.find((m) => m.id === editId)?.content}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={cancelContext}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Input area ── */}
      <div className={styles.inputArea}>
        <div className={styles.inputBox}>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              editId
                ? "메시지 수정..."
                : replyTo
                  ? `@${replyTo.nickname}님에게 답장...`
                  : `#${roomTitle || roomId}에 메시지 보내기`
            }
          />
          <div className={styles.inputActions}>
            <button
              className={styles.inputIconBtn}
              title="이모티콘"
              onClick={(e) => {
                e.stopPropagation();
                setShowMainEmojiPicker(!showMainEmojiPicker);
              }}
            >
              😊
            </button>
            {showMainEmojiPicker && (
              <div
                className={styles.mainEmojiPicker}
                onClick={(e) => e.stopPropagation()}
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                  locale="ko"
                />
              </div>
            )}
            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSend}
              title="전송"
            >
              <svg
                style={{ pointerEvents: "none" }}
                width="14"
                height="14"
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
      </div>

      {showSettings && (
        <RoomSettingsModal
          roomId={roomId}
          onClose={() => setShowSettings(false)}
          onUpdate={() => {
            socketRef.current?.emit("join_room", {
              roomId,
              nickname: name,
              userId,
            });
          }}
        />
      )}

      <ChatMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        members={roomMembers}
        authorNickname={roomAuthor}
        currentUserId={userId}
        onKick={(target) => {
          socketRef.current?.emit("kick_user", {
            roomId,
            targetUserId: target.user_id,
            targetNickname: target.nickname,
            myUserId: userId,
          });
        }}
      />
    </div>
  );
}
