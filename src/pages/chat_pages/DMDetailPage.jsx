import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/auth";
import instance, { BASE_URL, getImageUrl } from "../../api/instance";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";
<<<<<<< HEAD
=======
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  ChatMessageContent,
  MessageRowErrorBoundary,
} from "../../components/chat_components/ChatAttachment";
>>>>>>> bird
import ChatFileGallery from "../../components/chat_components/ChatFileGallery";
import UserProfileModal from "../../components/modals/UserProfileModal";
import ReactionCustomizerModal from "../../components/modals/ReactionCustomizerModal";
import ChatMessageItem from "../../components/chat_components/ChatMessageItem";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useCustomReactions } from "../../hooks/useCustomReactions";
import { formatChatPreview } from "../../utils/chatPreview";
import { createClientMessageId } from "../../utils/chatHelpers";

export default function DMDetailPage() {
  const { roomId } = useParams();
  const { name, userId, profileImg } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [targetNickname, setTargetNickname] = useState("");
  const [targetProfileImg, setTargetProfileImg] = useState("");

  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showFileGallery, setShowFileGallery] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [fileAccept, setFileAccept] = useState("");
  const [notificationsMuted, setNotificationsMuted] = useState(
    () => localStorage.getItem(`dm-muted:${roomId}`) === "1",
  );
  const [sending, setSending] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { reactions, saveReactions } = useCustomReactions();

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const sendingRef = useRef(false);
  const notificationsMutedRef = useRef(notificationsMuted);
  const targetNicknameRef = useRef("");

  const socketRoomId = `dm_${roomId}`;

  const {
    clearPendingFiles,
    addPendingFiles,
    removePendingFile,
    buildMessageContent,
    handlePaste,
    handleDrop,
  } = useFileUpload({ setPendingFiles, fileInputRef, inputRef });

  useEffect(() => {
    notificationsMutedRef.current = notificationsMuted;
  }, [notificationsMuted]);

  useEffect(() => {
    return () => {
      pendingFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const preventBrowserDrop = (event) => { event.preventDefault(); };
    window.addEventListener("dragover", preventBrowserDrop);
    window.addEventListener("drop", preventBrowserDrop);
    return () => {
      window.removeEventListener("dragover", preventBrowserDrop);
      window.removeEventListener("drop", preventBrowserDrop);
    };
  }, []);

  // ── Socket setup ──
  useEffect(() => {
    if (!userId || !name) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    socketRef.current = io(BASE_URL, {
      auth: { token: localStorage.getItem("token") },
    });
    const socket = socketRef.current;

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        if (msg.clientTempId) {
          const pendingIndex = prev.findIndex((m) => m.clientTempId === msg.clientTempId);
          if (pendingIndex !== -1) {
            return prev.map((m, index) =>
              index === pendingIndex
                ? { ...m, ...msg, isPending: false, isFailed: false, isEdited: msg.is_edited === 1, isDeleted: msg.is_deleted === 1, time: msg.created_at || msg.time || m.time }
                : m,
            );
          }
        }
        return [...prev, { ...msg, isEdited: msg.is_edited === 1, isDeleted: msg.is_deleted === 1, time: msg.created_at || new Date().toISOString() }];
      });

      if (!msg.isSystem && String(msg.userId) !== String(userId) && !notificationsMutedRef.current) {
        toast(`${targetNicknameRef.current || "상대방"}님이 새 메시지를 보냈습니다.`);
      }

      if (!msg.isSystem && String(msg.userId) !== String(userId)) {
        socket.emit("mark_read", { messageId: msg.id, userId, roomId: socketRoomId });
      }

      const isMine = String(msg.userId) === String(userId);
      const container = messagesRef.current;
      const isAtBottom = container && container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isMine || isAtBottom) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    });

    socket.on("room_info", ({ title, image }) => {
      targetNicknameRef.current = title || "";
      setTargetNickname(title);
      setTargetProfileImg(image);
    });

    socket.on("dm_room_deleted", ({ roomId: deletedRoomId }) => {
      if (String(deletedRoomId) !== String(roomId)) return;
      toast.success("대화 기록이 삭제되었습니다.");
      navigate("/dms", { replace: true });
    });

    socket.on("load_messages", (rawMessages) => {
      const formatted = rawMessages.map((msg) => ({
        id: msg.id, roomId: msg.room_id, userId: msg.user_id, nickname: msg.nickname,
        profileImg: msg.profileImg, content: msg.content, isSystem: msg.is_system === 1,
        isEdited: msg.is_edited === 1, isDeleted: msg.is_deleted === 1,
        parentId: msg.parent_id, reactions: msg.reactions || [], readCount: msg.readCount || 0,
        time: msg.created_at,
      }));
      setMessages(formatted);
      if (formatted.length > 0) {
        formatted.forEach((m) => {
          if (!m.isSystem && String(m.userId) !== String(userId)) {
            socket.emit("mark_read", { messageId: m.id, userId, roomId: socketRoomId });
          }
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 100);
      }
    });

    socket.emit("join_room", { roomId: socketRoomId, nickname: name, userId });

    socket.on("message_edited", ({ messageId, content }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, content, isEdited: true } : m));
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: "삭제된 메시지입니다." } : m));
      setEditId((prev) => { if (prev === messageId) { setInput(""); return null; } return prev; });
    });

    socket.on("update_reactions", ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m));
    });

    socket.on("update_read_count", ({ messageId, readCount }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, readCount } : m));
    });

    return () => socket.disconnect();
  }, [roomId, userId, name, navigate, socketRoomId]);

  useEffect(() => {
    let mounted = true;
    const loadRoom = async () => {
      try {
        const { data } = await instance.get(`/chat/dm/${roomId}`);
        if (!mounted) return;
        targetNicknameRef.current = data.targetNickname || "";
        setTargetNickname(data.targetNickname || "");
        setTargetProfileImg(data.targetProfileImg || "");
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 404) { toast.error("이미 삭제된 대화입니다."); navigate("/dms", { replace: true }); return; }
        console.error("Failed to load DM room:", err);
      }
    };
    loadRoom();
    return () => { mounted = false; };
  }, [roomId, navigate]);

  useEffect(() => {
    const handleClickOutside = () => { setShowEmojiPicker(null); setShowMainEmojiPicker(false); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEmojiSelect = (emoji) => {
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const text = input;
    setInput(text.substring(0, start) + emoji.native + text.substring(end, text.length));
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
    }, 0);
  };

  const handleScroll = () => {
    const container = messagesRef.current;
    if (!container) return;
    setShowScrollBtn(container.scrollHeight - container.scrollTop > container.clientHeight + 200);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const toggleNotifications = () => {
    const next = !notificationsMuted;
    setNotificationsMuted(next);
    localStorage.setItem(`dm-muted:${roomId}`, next ? "1" : "0");
    toast.success(next ? "DM 알림을 껐습니다." : "DM 알림을 켰습니다.");
  };

  const handleLeaveDM = async () => {
    if (!window.confirm("정말로 이 대화를 나가고 기록을 삭제하시겠습니까?")) return;
    try {
      await instance.delete(`/chat/dm/${roomId}`);
      toast.success("대화 기록을 삭제하고 나갔습니다.");
      navigate("/dms", { replace: true });
    } catch (err) {
      console.error("Failed to delete DM room:", err);
      if (err?.response?.status === 404) { toast.error("이미 삭제된 대화입니다."); navigate("/dms", { replace: true }); return; }
      toast.error("대화 나가기에 실패했습니다.");
    }
  };

  const openFilePicker = useCallback((accept) => {
    setFileAccept(accept);
    setShowAttachMenu(false);
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  }, []);

  const handleSend = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (sendingRef.current) return;
      if ((!input.trim() && pendingFiles.length === 0) || !socketRef.current) return;

      if (editId) {
        if (!input.trim()) return;
        socketRef.current.emit("edit_message", { messageId: editId, content: input, roomId: socketRoomId, userId });
        setEditId(null);
      } else {
        sendingRef.current = true;
        setSending(true);
        let clientTempId = null;
        try {
          const isUploadingMessage = pendingFiles.length > 0;
<<<<<<< HEAD
          setMessages((prev) => [...prev, {
            id: clientTempId, clientTempId, roomId: socketRoomId, userId, nickname: name, profileImg,
            content: isUploadingMessage ? "파일 업로드 중..." : input.trim(),
            isSystem: false, isPending: true, isUploading: isUploadingMessage, isFailed: false,
            parentId: replyTo?.id || null, reactions: [], readCount: 0, time: new Date().toISOString(),
          }]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
          const content = await buildMessageContent(input, pendingFiles);
          setMessages((prev) => prev.map((m) => m.clientTempId === clientTempId ? { ...m, content, isUploading: false } : m));
          socketRef.current.emit("send_message", {
            clientTempId, roomId: socketRoomId, userId, nickname: name, profileImg, content,
            isSystem: false, parentId: replyTo?.id || null, time: new Date().toISOString(),
          }, (res) => {
            if (!res?.ok) {
              setMessages((prev) => prev.map((m) => m.clientTempId === clientTempId ? { ...m, isPending: false, isFailed: true } : m));
              toast.error("메시지 전송에 실패했습니다.");
            }
          });
=======
          if (!isUploadingMessage) {
            clientTempId = createClientMessageId();
            setMessages((prev) => [
              ...prev,
              {
                id: clientTempId,
                clientTempId,
                roomId: socketRoomId,
                userId,
                nickname: name,
                profileImg,
                content: input.trim(),
                isSystem: false,
                isPending: true,
                isUploading: false,
                isFailed: false,
                parentId: replyTo?.id || null,
                reactions: [],
                readCount: 0,
                time: new Date().toISOString(),
              },
            ]);
            setTimeout(
              () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
              0,
            );
          }
          const content = await buildMessageContent();
          if (clientTempId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientTempId === clientTempId
                  ? { ...m, content, isUploading: false }
                  : m,
              ),
            );
          }
          socketRef.current.emit(
            "send_message",
            {
              clientTempId,
              roomId: socketRoomId,
              userId,
              nickname: name,
              profileImg,
              content,
              isSystem: false,
              parentId: replyTo?.id || null,
              time: new Date().toISOString(),
            },
            (res) => {
              if (clientTempId && !res?.ok) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.clientTempId === clientTempId
                      ? { ...m, isPending: false, isFailed: true }
                      : m,
                  ),
                );
                toast.error("메시지 전송에 실패했습니다.");
              }
            },
          );
>>>>>>> bird
          setReplyTo(null);
          clearPendingFiles();
          if (!clientTempId) {
            setTimeout(
              () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
              0,
            );
          }
        } catch (error) {
          if (clientTempId) {
            setMessages((prev) => prev.map((m) => m.clientTempId === clientTempId ? { ...m, isPending: false, isUploading: false, isFailed: true } : m));
          }
          console.error("Failed to upload chat file:", error);
          toast.error(error?.response?.data?.message || "파일 업로드에 실패했습니다.");
          clearPendingFiles();
          sendingRef.current = false;
          setSending(false);
          return;
        }
        sendingRef.current = false;
        setSending(false);
      }
      setInput("");
      inputRef.current?.focus();
    },
    [input, pendingFiles, editId, socketRoomId, userId, name, profileImg, replyTo, buildMessageContent, clearPendingFiles],
  );

  const startEdit = (msg) => { setEditId(msg.id); setInput(msg.content); setReplyTo(null); setTimeout(() => inputRef.current?.focus(), 0); };
  const startReply = (msg) => { setReplyTo(msg); setEditId(null); setInput(""); setTimeout(() => inputRef.current?.focus(), 0); };
  const handleDelete = (msgId) => {
    toast("메시지를 삭제하시겠습니까?", {
      action: { label: "삭제", onClick: () => { socketRef.current.emit("delete_message", { messageId: msgId, roomId: socketRoomId, userId }); if (editId === msgId) { setEditId(null); setInput(""); } } },
    });
  };
  const toggleReaction = (msgId, emoji) => { socketRef.current.emit("react_message", { messageId: msgId, userId, emoji, roomId: socketRoomId }); setShowEmojiPicker(null); };
  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add(styles.highlight); setTimeout(() => el.classList.remove(styles.highlight), 2000); }
    else { toast.error("원본 메시지를 찾을 수 없습니다."); }
  };
  const cancelContext = () => { setReplyTo(null); setEditId(null); setInput(""); };

  return (
    <div className={styles.chatWrap} onDrop={(e) => handleDrop(e, addPendingFiles)} onDragOver={(e) => e.preventDefault()}>
      <div className={styles.header}>
        <div className={styles.headerThumb}>
          {targetProfileImg ? <img src={getImageUrl(targetProfileImg)} alt="target" /> : <span className={styles.headerHashIcon}>👤</span>}
        </div>
        <span className={styles.headerName}>{targetNickname || "사용자"}</span>
        <div className={styles.headerDivider} />
        <span className={styles.headerDesc}>{targetNickname}님과의 대화입니다.</span>
        <div className={styles.headerActions}>
          <button className={styles.headerIconBtn} title={notificationsMuted ? "DM 알림 켜기" : "DM 알림 끄기"} onClick={toggleNotifications}>{notificationsMuted ? "🔕" : "🔔"}</button>
          <button className={styles.headerIconBtn} title="파일 모아보기" onClick={() => setShowFileGallery(true)}>📎</button>
          <button className={styles.headerIconBtn} title="나가기" onClick={handleLeaveDM}>🚪</button>
        </div>
      </div>

      <div className={styles.messages} ref={messagesRef} onScroll={handleScroll}>
        {messages.map((msg, idx) => {
          const reactionMap = (msg.reactions || []).reduce((acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
            acc[r.emoji].count++;
            if (String(r.userId || r.user_id) === String(userId)) acc[r.emoji].mine = true;
            return acc;
          }, {});

          return (
<<<<<<< HEAD
            <ChatMessageItem
              key={msg.id || idx}
              msg={msg} idx={idx} messages={messages} userId={userId}
              reactionMap={reactionMap} reactions={reactions}
              toggleReaction={toggleReaction}
              showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker}
              startReply={startReply} startEdit={startEdit}
              handleDelete={handleDelete} setShowCustomizer={setShowCustomizer}
              scrollToMessage={scrollToMessage} setSelectedProfileId={setSelectedProfileId}
              hoveredMsgId={hoveredMsgId} setHoveredMsgId={setHoveredMsgId}
              variant="dm"
            />
=======
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
                      onClick={() => setSelectedProfileId(msg.userId)}
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
                        onClick={() => setSelectedProfileId(msg.userId)}
                        style={{ cursor: "pointer" }}
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
                          : formatChatPreview(parentMsg.content)}
                      </span>
                    </div>
                  )}

                  {/* 메시지 본문 */}
                  <MessageRowErrorBoundary fallbackText={msg.content}>
                    <div
                      className={`${styles.msgBubble} ${
                        msg.isDeleted ? styles.deleted : ""
                      } ${msg.isPending ? styles.pendingMessage : ""} ${
                        msg.isFailed ? styles.failedMessage : ""
                      }`}
                    >
                      <ChatMessageContent content={msg.content} />
                      {msg.isEdited && !msg.isDeleted && (
                        <span className={styles.editedTag}>(수정됨)</span>
                      )}
                    </div>
                  </MessageRowErrorBoundary>

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
                {hoveredMsgId === msg.id &&
                  !msg.isDeleted &&
                  !msg.isPending &&
                  !msg.isFailed && (
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
>>>>>>> bird
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button className={styles.scrollToBottom} onClick={scrollToBottom} title="최신 메시지 보기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      )}

      <ChatInputArea
        input={input} setInput={setInput} handleSend={handleSend}
        sending={sending} editId={editId} replyTo={replyTo} cancelContext={cancelContext}
        pendingFiles={pendingFiles} removePendingFile={removePendingFile}
        addPendingFiles={addPendingFiles} openFilePicker={openFilePicker}
        handlePaste={handlePaste} handleEmojiSelect={handleEmojiSelect}
        inputRef={inputRef} fileInputRef={fileInputRef} fileAccept={fileAccept}
        showAttachMenu={showAttachMenu} setShowAttachMenu={setShowAttachMenu}
        showMainEmojiPicker={showMainEmojiPicker} setShowMainEmojiPicker={setShowMainEmojiPicker}
        roomId={roomId} targetNickname={targetNickname}
        formatChatPreview={formatChatPreview} messages={messages}
      />

      {showCustomizer && (
        <ReactionCustomizerModal
          currentReactions={reactions}
          onSave={(newReactions) => { saveReactions(newReactions); setShowCustomizer(false); }}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {selectedProfileId && (
        <UserProfileModal userId={selectedProfileId} currentUserId={userId} onClose={() => setSelectedProfileId(null)} />
      )}

      {showFileGallery && <ChatFileGallery messages={messages} onClose={() => setShowFileGallery(false)} />}
    </div>
  );
}
