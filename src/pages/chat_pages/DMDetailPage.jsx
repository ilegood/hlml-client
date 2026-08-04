<<<<<<< Updated upstream
﻿import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/auth";
import { BASE_URL, getImageUrl } from "../../api/instance";
import { deleteDmRoom, getDmRoom, uploadChatFile } from "../../api/chat";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";
import {
  ChatMessageContent,
  MessageRowErrorBoundary,
} from "../../components/chat_components/ChatAttachment";
import ChatFileGallery from "../../components/chat_components/ChatFileGallery";
import ChatAvatar from "../../components/chat_components/ChatAvatar";
import LazyEmojiPicker from "../../components/chat_components/LazyEmojiPicker";
import UserProfileModal from "../../components/modals/UserProfileModal";
=======
import ChatMessageList from "../../components/chat_components/ChatMessageList";
import ChatScrollButton from "../../components/chat_components/ChatScrollButton";
import DMHeader from "../../components/chat_components/DMHeader";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import DMChatOverlays from "../../components/chat_components/DMChatOverlays";
import useDMChat from "../../hooks/useDMChat";
>>>>>>> Stashed changes
import { formatChatPreview } from "../../utils/chatPreview";
import { usePendingChatFiles } from "../../hooks/usePendingChatFiles";
import {
  createClientMessageId,
  formatDate,
  formatTime,
  isCompact,
  isSameDay,
} from "../../utils/chatHelpers";

// Main Component

export default function DMDetailPage() {
<<<<<<< Updated upstream
  const { roomId } = useParams(); // Numeric ID from dm_rooms table
  const { name, userId, profileImg } = useContext(AuthContext);
  const navigate = useNavigate();
=======
  const {
    roomId, userId, messages, input, setInput,
    targetUserId, targetNickname, targetProfileImg, targetOnline,
    replyTo, editId, hoveredMsgId, setHoveredMsgId, showEmojiPicker, setShowEmojiPicker,
    showMainEmojiPicker, setShowMainEmojiPicker, showScrollBtn,
    showFileGallery, setShowFileGallery, notificationsMuted, sending,
    selectedProfileId, setSelectedProfileId,
    bottomRef, messagesRef, inputRef, fileInputRef,
    pendingFiles, showAttachMenu, setShowAttachMenu, fileAccept,
    addPendingFiles, openFilePicker, removePendingFile, resizeInput,
    handleEmojiSelect, handleScroll, scrollToBottom, toggleNotifications,
    handleLeaveDM, handleSend, startEdit, startReply, handleDelete,
    toggleReaction, scrollToMessage, cancelContext, handlePaste,
    handleDrop, handleDragOver, handleInputChange,
  } = useDMChat();
>>>>>>> Stashed changes

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);
  const [targetNickname, setTargetNickname] = useState("");
  const [targetProfileImg, setTargetProfileImg] = useState("");
  const [targetOnline, setTargetOnline] = useState(false);

  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showFileGallery, setShowFileGallery] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(
    () => localStorage.getItem(`dm-muted:${roomId}`) === "1",
  );
  const [sending, setSending] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [typingNickname, setTypingNickname] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingEmitRef = useRef(0);
  const {
    pendingFiles,
    showAttachMenu,
    setShowAttachMenu,
    fileAccept,
    clearPendingFiles,
    addPendingFiles,
    openFilePicker,
    removePendingFile,
  } = usePendingChatFiles({ inputRef, fileInputRef });

  const resizeInput = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeInput();
  }, [input, resizeInput]);
  const sendingRef = useRef(false);
  const notificationsMutedRef = useRef(notificationsMuted);
  const targetNicknameRef = useRef("");
  const targetIdRef = useRef(null);

  const socketRoomId = `dm_${roomId}`;

  useEffect(() => {
    notificationsMutedRef.current = notificationsMuted;
  }, [notificationsMuted]);

  useEffect(() => {
    const preventBrowserDrop = (event) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", preventBrowserDrop);
    window.addEventListener("drop", preventBrowserDrop);

    return () => {
      window.removeEventListener("dragover", preventBrowserDrop);
      window.removeEventListener("drop", preventBrowserDrop);
    };
  }, []);

  // ── Socket setup ────────────────────────────────────────────────────────────

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
        if (
          msg.isSystem &&
          prev.some(
            (m) =>
              m.isSystem &&
              String(m.userId) === String(msg.userId) &&
              m.content === msg.content,
          )
        )
          return prev;
        if (msg.clientTempId) {
          const pendingIndex = prev.findIndex(
            (m) => m.clientTempId === msg.clientTempId,
          );
          if (pendingIndex !== -1) {
            return prev.map((m, index) =>
              index === pendingIndex
                ? {
                    ...m,
                    ...msg,
                    isPending: false,
                    isFailed: false,
                    isEdited: msg.is_edited === 1,
                    isDeleted: msg.is_deleted === 1,
                    time: msg.created_at || msg.time || m.time,
                  }
                : m,
            );
          }
        }

        return [
          ...prev,
          {
            ...msg,
            isEdited: msg.is_edited === 1,
            isDeleted: msg.is_deleted === 1,
            time: msg.created_at || new Date().toISOString(),
          },
        ];
      });

      if (
        !msg.isSystem &&
        String(msg.userId) !== String(userId) &&
        !notificationsMutedRef.current
      ) {
        toast(
          `${targetNicknameRef.current || "상대방"}님이 새 메시지를 보냈습니다.`,
        );
      }

      if (!msg.isSystem && String(msg.userId) !== String(userId)) {
        socket.emit("mark_read", {
          messageId: msg.id,
          userId,
          roomId: socketRoomId,
        });
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
      const seen = new Map();
      const formatted = [];
      for (const msg of rawMessages) {
        const isSystem = msg.is_system === 1;
        if (isSystem) {
          const key = `${msg.user_id}:${msg.content}`;
          if (seen.has(key)) continue;
          seen.set(key, true);
        }
        formatted.push({
          id: msg.id,
          roomId: msg.room_id,
          userId: msg.user_id,
          nickname: msg.nickname,
          profileImg: msg.profileImg,
          content: msg.content,
          isSystem,
          isEdited: msg.is_edited === 1,
          isDeleted: msg.is_deleted === 1,
          parentId: msg.parent_id,
          reactions: msg.reactions || [],
          readCount: msg.readCount || 0,
          time: msg.created_at,
        });
      }
      setMessages(formatted);

      if (formatted.length > 0) {
        formatted.forEach((m) => {
          if (!m.isSystem && String(m.userId) !== String(userId)) {
            socket.emit("mark_read", {
              messageId: m.id,
              userId,
              roomId: socketRoomId,
            });
          }
        });
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "auto" }),
          100,
        );
      }
    });

    socket.emit("join_room", { roomId: socketRoomId, nickname: name, userId });

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

    socket.on("typing", ({ nickname }) => {
      if (nickname !== name && nickname) {
        setTypingNickname(nickname);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTypingNickname(""), 2500);
      }
    });

    socket.on("stop_typing", () => {
      setTypingNickname("");
      clearTimeout(typingTimerRef.current);
    });

    socket.on("friend_online_status", ({ userId: friendId, online }) => {
      if (targetIdRef.current && Number(friendId) === targetIdRef.current) {
        setTargetOnline(online);
      }
    });

    return () => socket.disconnect();
  }, [roomId, userId, name, navigate, socketRoomId]);

  useEffect(() => {
    let mounted = true;

    const loadRoom = async () => {
      try {
        const data = await getDmRoom(roomId);
        if (!mounted) return;

        targetNicknameRef.current = data.targetNickname || "";
        setTargetUserId(data.targetId || null);
        setTargetNickname(data.targetNickname || "");
        setTargetProfileImg(data.targetProfileImg || "");
        targetIdRef.current = data.targetId ? Number(data.targetId) : null;
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 404) {
          toast.error("이미 삭제된 대화입니다.");
          navigate("/dms", { replace: true });
          return;
        }
        console.error("Failed to load DM room:", err);
      }
    };

    loadRoom();

    return () => {
      mounted = false;
    };
  }, [roomId, navigate]);

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

  const toggleNotifications = () => {
    const next = !notificationsMuted;
    setNotificationsMuted(next);
    localStorage.setItem(`dm-muted:${roomId}`, next ? "1" : "0");
    toast.success(next ? "DM 알림을 껐습니다." : "DM 알림을 켰습니다.");
  };

  const handleLeaveDM = async () => {
    if (!window.confirm("정말로 이 대화를 나가고 기록을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteDmRoom(roomId);
      toast.success("대화 기록을 삭제하고 나갔습니다.");
      navigate("/dms", { replace: true });
    } catch (err) {
      console.error("Failed to delete DM room:", err);
      if (err?.response?.status === 404) {
        toast.error("이미 삭제된 대화입니다.");
        navigate("/dms", { replace: true });
        return;
      }
      toast.error("대화 나가기에 실패했습니다.");
    }
  };

  const buildMessageContent = useCallback(async () => {
    const text = input.trim();
    if (pendingFiles.length === 0) return text;

    const uploads = await Promise.all(
      pendingFiles.map((item) => uploadChatFile(item.file)),
    );
    return JSON.stringify({
      kind: "chat_payload",
      text,
      attachments: uploads.map((uploaded) => ({
        url: uploaded.url,
        downloadUrl: uploaded.downloadUrl,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        name: uploaded.name,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
      })),
    });
  }, [input, pendingFiles]);

  const handleSend = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (sendingRef.current) return;
      if ((!input.trim() && pendingFiles.length === 0) || !socketRef.current)
        return;

      if (editId) {
        if (!input.trim()) return;
        socketRef.current.emit("edit_message", {
          messageId: editId,
          content: input,
          roomId: socketRoomId,
          userId,
        });
        setEditId(null);
      } else {
        sendingRef.current = true;
        setSending(true);
        let clientTempId = null;
        try {
          const isUploadingMessage = pendingFiles.length > 0;
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
            setMessages((prev) =>
              prev.map((m) =>
                m.clientTempId === clientTempId
                  ? {
                      ...m,
                      isPending: false,
                      isUploading: false,
                      isFailed: true,
                    }
                  : m,
              ),
            );
          }
          console.error("Failed to upload chat file:", error);
          toast.error(
            error?.response?.data?.message || "파일 업로드에 실패했습니다.",
          );
          sendingRef.current = false;
          setSending(false);
          return;
        }
        sendingRef.current = false;
        setSending(false);
      }
      setInput("");
      socketRef.current?.emit("stop_typing", { roomId: socketRoomId });
      inputRef.current?.focus();
    },
    [
      input,
      pendingFiles.length,
      editId,
      socketRoomId,
      userId,
      name,
      profileImg,
      replyTo,
      buildMessageContent,
      clearPendingFiles,
    ],
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
            roomId: socketRoomId,
            userId,
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
      roomId: socketRoomId,
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

  const cancelContext = () => {
    setReplyTo(null);
    setEditId(null);
    setInput("");
  };

  const handlePaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (
      files.some(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/"),
      )
    ) {
      e.preventDefault();
      addPendingFiles(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addPendingFiles(e.dataTransfer?.files);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={styles.chatWrap}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
<<<<<<< Updated upstream
      {/* ── Header ── */}
      <div className={styles.header}>
        <button
          type="button"
          className={`${styles.headerThumb} ${styles.headerProfileButton}`}
          disabled={!targetUserId}
          onClick={() => setSelectedProfileId(targetUserId)}
          title="프로필 보기"
        >
          {targetProfileImg ? (
            <img
              src={getImageUrl(targetProfileImg)}
              alt="target"
              style={{ backgroundColor: "white" }}
            />
          ) : (
            <span className={styles.headerHashIcon}>👤</span>
          )}
        </button>
        <span
          className={styles.headerName}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {targetNickname || "사용자"}
          {targetOnline && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#31c48d",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#31c48d",
                  display: "inline-block",
                }}
              />
              온라인
            </span>
          )}
        </span>
        <div className={styles.headerDivider} />
        <span className={styles.headerDesc}>
          {targetNickname}님과의 대화입니다.
        </span>
        <div className={styles.headerActions}>
          <button
            className={styles.headerIconBtn}
            title={notificationsMuted ? "DM 알림 켜기" : "DM 알림 끄기"}
            onClick={toggleNotifications}
          >
            {notificationsMuted ? "🔕" : "🔔"}
          </button>
          <button
            className={styles.headerIconBtn}
            title="파일 모아보기"
            onClick={() => setShowFileGallery(true)}
          >
            📎
          </button>
          <button
            className={styles.headerIconBtn}
            title="나가기"
            onClick={handleLeaveDM}
          >
            🚪
          </button>
        </div>
      </div>
=======
      {/* Header */}
      <DMHeader
        targetUserId={targetUserId}
        targetProfileImg={targetProfileImg}
        targetNickname={targetNickname}
        targetOnline={targetOnline}
        setSelectedProfileId={setSelectedProfileId}
        notificationsMuted={notificationsMuted}
        toggleNotifications={toggleNotifications}
        setShowFileGallery={setShowFileGallery}
        handleLeaveDM={handleLeaveDM}
      />
>>>>>>> Stashed changes

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
            let parsed = null;
            try {
              parsed = JSON.parse(msg.content);
            } catch {
              /* not JSON */
            }

            const isSharePost = parsed?.kind === "share_post";
            let displayText = msg.content;

            if (isSharePost) {
              const sharer = parsed.sharerNickname || "알 수 없음";
              const title = parsed.postTitle || "게시글";
              displayText = `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
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
                <div className={styles.systemMsg}>{displayText}</div>
                {isSharePost ? (
                  <button
                    type="button"
                    className={styles.sharedPostCard}
                    onClick={() => navigate(`/detail/${parsed.postId}`)}
                    disabled={!parsed.postId}
                  >
                    {parsed.postImage && (
                      <div className={styles.sharedPostImageContainer}>
                        <img
                          src={getImageUrl(parsed.postImage)}
                          alt=""
                          className={styles.sharedPostImage}
                        />
                      </div>
                    )}
                    <div className={styles.sharedPostContent}>
                      <span className={styles.sharedPostEyebrow}>
                        공유된 게시글
                      </span>
                      <strong className={styles.sharedPostTitle}>
                        {parsed.postTitle || "게시글"}
                      </strong>
                      <span className={styles.sharedPostMeta}>
                        {parsed.sharerNickname || "알 수 없음"}님이
                        공유했습니다.
                      </span>
                    </div>
                  </button>
                ) : null}
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
                    <ChatAvatar
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
                            <LazyEmojiPicker
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
          aria-label="맨 밑으로 내려가기"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>맨 밑으로</span>
        </button>
      )}

<<<<<<< Updated upstream
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
                ? formatChatPreview(replyTo.content)
                : formatChatPreview(
                    messages.find((m) => m.id === editId)?.content,
                  )}
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

      {/* ── Typing indicator ── */}
      {typingNickname && (
        <div
          style={{
            padding: "4px 16px",
            fontSize: 12,
            color: "var(--color-text-secondary, #888)",
            fontStyle: "italic",
          }}
        >
          {typingNickname}님이 입력중입니다...
        </div>
      )}

      {/* ── Input area ── */}
      <div className={styles.inputArea}>
        {pendingFiles.length > 0 && (
          <div className={styles.pendingAttachments}>
            {pendingFiles.map((item) => (
              <div className={styles.pendingItem} key={item.id}>
                {item.file.type.startsWith("video/") ? (
                  <video
                    className={styles.pendingThumb}
                    src={item.previewUrl}
                    muted
                  />
                ) : item.file.type.startsWith("image/") ? (
                  <img
                    className={styles.pendingThumb}
                    src={item.previewUrl}
                    alt={item.file.name}
                  />
                ) : (
                  <div className={styles.pendingFilePreview}>
                    <span className={styles.pendingFileIcon}>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <span className={styles.pendingFileName}>
                      {item.file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={styles.pendingRemove}
                  title="첨부 삭제"
                  disabled={sending}
                  onClick={() => removePendingFile(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
            {sending && (
              <div className={styles.uploadStatus} role="status">
                {pendingFiles.some((item) =>
                  item.file.type.startsWith("image/"),
                )
                  ? "이미지 업로드 중..."
                  : "파일 업로드 중..."}
              </div>
            )}
          </div>
        )}
        <div className={styles.inputBox}>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            multiple
            className={styles.fileInput}
            onChange={(e) => addPendingFiles(e.target.files)}
          />
          {showAttachMenu && (
            <div className={styles.attachMenu}>
              <button
                type="button"
                onClick={() => openFilePicker("image/*,video/*")}
              >
                이미지/동영상 선택
              </button>
              <button type="button" onClick={() => openFilePicker("")}>
                일반 파일 선택
              </button>
            </div>
          )}
          <button
            type="button"
            className={styles.attachBtn}
            title="파일 추가"
            disabled={sending}
            onClick={() => setShowAttachMenu((prev) => !prev)}
          >
            +
          </button>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (!e.target.value.trim()) {
                socketRef.current?.emit("stop_typing", {
                  roomId: socketRoomId,
                });
              } else {
                const now = Date.now();
                if (now - typingEmitRef.current > 2000) {
                  typingEmitRef.current = now;
                  socketRef.current?.emit("typing", {
                    roomId: socketRoomId,
                    nickname: name,
                  });
                }
              }
            }}
            onInput={resizeInput}
            onCompositionEnd={resizeInput}
            onPaste={handlePaste}
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
                  : `${targetNickname}님에게 메시지 보내기`
            }
            rows={1}
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
                <LazyEmojiPicker
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
              disabled={sending}
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
=======
      <ChatInputArea
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        sending={sending}
        editId={editId}
        replyTo={replyTo}
        cancelContext={cancelContext}
        pendingFiles={pendingFiles}
        removePendingFile={removePendingFile}
        addPendingFiles={addPendingFiles}
        openFilePicker={openFilePicker}
        handlePaste={handlePaste}
        handleEmojiSelect={handleEmojiSelect}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        fileAccept={fileAccept}
        showAttachMenu={showAttachMenu}
        setShowAttachMenu={setShowAttachMenu}
        showMainEmojiPicker={showMainEmojiPicker}
        setShowMainEmojiPicker={setShowMainEmojiPicker}
        roomTitle={targetNickname}
        roomId={roomId}
        formatChatPreview={formatChatPreview}
        messages={messages}
        onInputChange={handleInputChange}
        onInput={resizeInput}
        onCompositionEnd={resizeInput}
      />
>>>>>>> Stashed changes

      <DMChatOverlays
        currentUserId={userId}
        messages={messages}
        selectedProfileId={selectedProfileId}
        setSelectedProfileId={setSelectedProfileId}
        setShowFileGallery={setShowFileGallery}
        showFileGallery={showFileGallery}
      />
    </div>
  );
}
