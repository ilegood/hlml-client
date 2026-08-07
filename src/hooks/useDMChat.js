import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import instance, { BASE_URL } from "../api/instance";
import { uploadChatFile } from "../api/chat";
import { toast } from "sonner";
import { createClientMessageId } from "../utils/chatHelpers";
import { usePendingChatFiles } from "./usePendingChatFiles";

export default function useDMChat() {
  const { roomId } = useParams(); // Numeric ID from dm_rooms table
  const { name, userId, profileImg } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
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
        const { data } = await instance.get(`/chat/dm/${roomId}`);
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
      await instance.delete(`/chat/dm/${roomId}`);
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

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("[animation:highlightMessage_2s_ease-out]");
      setTimeout(
        () => el.classList.remove("[animation:highlightMessage_2s_ease-out]"),
        2000,
      );
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

  return {
    roomId,
    name,
    userId,
    messages,
    input,
    setInput,
    targetUserId,
    targetNickname,
    targetProfileImg,
    targetOnline,
    replyTo,
    editId,
    hoveredMsgId,
    setHoveredMsgId,
    showEmojiPicker,
    setShowEmojiPicker,
    showMainEmojiPicker,
    setShowMainEmojiPicker,
    showScrollBtn,
    showFileGallery,
    setShowFileGallery,
    notificationsMuted,
    sending,
    selectedProfileId,
    setSelectedProfileId,
    socketRef,
    bottomRef,
    messagesRef,
    inputRef,
    fileInputRef,
    typingEmitRef,
    pendingFiles,
    showAttachMenu,
    setShowAttachMenu,
    fileAccept,
    addPendingFiles,
    openFilePicker,
    removePendingFile,
    resizeInput,
    handleEmojiSelect,
    handleScroll,
    scrollToBottom,
    toggleNotifications,
    handleLeaveDM,
    handleSend,
    startEdit,
    startReply,
    handleDelete,
    toggleReaction,
    scrollToMessage,
    cancelContext,
    handlePaste,
    handleDrop,
    socketRoomId,
  };
}
