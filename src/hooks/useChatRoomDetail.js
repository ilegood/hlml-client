import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/auth";
import { useChatNotifications } from "../context/ChatNotificationContext";
import { BASE_URL } from "../api/instance";
import { getRoomBlockWarning, uploadChatFile } from "../api/chat";
import { leavePost, getPost, togglePostJoin } from "../api/posts";
import { toast } from "sonner";
import { formatChatPreview } from "../utils/chatPreview";
import {
  formatAppointmentDateTime,
  displayName,
  createClientMessageId,
  normalizeRoomAppointment,
} from "../utils/chatHelpers";
import { usePendingChatFiles } from "./usePendingChatFiles";

export default function useChatRoomDetail() {
  const { roomId } = useParams();
  const { name, userId, profileImg } = useContext(AuthContext);
  const { notifications } = useChatNotifications() || {};
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomImage, setRoomImage] = useState("");
  const [roomAuthor, setRoomAuthor] = useState("");
  const [roomLocation, setRoomLocation] = useState(null);
  const [roomAppointment, setRoomAppointment] = useState(() =>
    normalizeRoomAppointment(),
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editId, setEditId] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMainEmojiPicker, setShowMainEmojiPicker] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showFileGallery, setShowFileGallery] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(
    () => localStorage.getItem(`chat-muted:${roomId}`) === "1",
  );
  const [sending, setSending] = useState(false);
  const [blockWarning, setBlockWarning] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [postData, setPostData] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [typingNickname, setTypingNickname] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingEmitRef = useRef(0);
  const joinEmittedRef = useRef(false);
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
  const appointmentReminder = (notifications?.reminders || []).find(
    (item) => String(item.roomId) === String(roomId),
  );

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

  // Socket setup
  useEffect(() => {
    if (!userId || !name) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    if (!isParticipant) return;

    socketRef.current = io(BASE_URL, {
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 5,
    });
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // join_room은 한 번만 emit (소켓 재연결시 중복 방지)
      if (joinEmittedRef.current) return;
      joinEmittedRef.current = true;
      socket.emit("join_room", { roomId, nickname: name, userId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err);
      toast.error("채팅 서버 연결에 실패했습니다.");
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        if (msg.isSystem && prev.some((m) => m.isSystem && String(m.userId) === String(msg.userId) && m.content === msg.content)) return prev;
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
                    isEdited: msg.is_edited === 1 || msg.isEdited,
                    isDeleted: msg.is_deleted === 1 || msg.isDeleted,
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
            isEdited: msg.is_edited === 1 || msg.isEdited,
            isDeleted: msg.is_deleted === 1 || msg.isDeleted,
            time: msg.created_at || msg.time || new Date().toISOString(),
          },
        ];
      });

      if (!msg.isSystem && String(msg.userId) !== String(userId)) {
        if (!notificationsMutedRef.current) {
          toast(`${msg.nickname || "상대방"}님이 새 메시지를 보냈습니다.`);
        }
        socket.emit("mark_read", { messageId: msg.id, userId, roomId });
      }

      const isMine = String(msg.userId) === String(userId);
      const container = messagesRef.current;
      const isAtBottom =
        container &&
        container.scrollHeight - container.scrollTop <=
          container.clientHeight + 150;
      if (isMine || isAtBottom) {
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      }
    });

    socket.on("room_info", (info) => {
      const { title, image, author, place, latitude, longitude } = info;
      setRoomTitle(title);
      setRoomImage(image);
      setRoomAuthor(author);
      setRoomLocation({
        place,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
      setRoomAppointment(normalizeRoomAppointment(info));
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

    socket.on("chat_room_deletion_warning", (warning) => {
      if (String(warning.roomId) !== String(roomId)) return;
      const key = `room-delete-warning:${userId}:${warning.roomId}:${warning.deletesAt}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      toast.warning(`${warning.title || "채팅방"}이 30분 뒤 삭제됩니다.`, {
        description: warning.message,
      });
    });

    socket.on("chat_room_deleted", ({ roomId: deletedRoomId, title }) => {
      if (String(deletedRoomId) !== String(roomId)) return;
      const key = `room-deleted:${userId}:${deletedRoomId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        toast(`${title || "채팅방"}이 삭제되었습니다.`);
      }
      navigate("/chat-rooms", { replace: true });
      window.dispatchEvent(new Event("chat:rooms-changed"));
    });

    socket.on("typing", ({ nickname }) => {
      if (nickname !== name) {
        setTypingNickname(displayName(nickname));
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTypingNickname(""), 2500);
      }
    });

    socket.on("stop_typing", () => {
      setTypingNickname("");
      clearTimeout(typingTimerRef.current);
    });

    return () => {
      joinEmittedRef.current = false;
      socket.disconnect();
    };
  }, [roomId, userId, name, navigate, isParticipant]);

  useEffect(() => {
    if (!userId || !roomId) return;

    const loadBlockWarning = async () => {
      try {
        const cleanRoomId = String(roomId).match(/^\d+/)?.[0];
        if (!cleanRoomId) {
          console.warn("Invalid roomId for block warning lookup:", roomId);
          return;
        }

        const data = await getRoomBlockWarning(cleanRoomId);
        const blockedUsers = data?.blockedUsers || [];
        if (blockedUsers.length === 0) return;
        const ids = blockedUsers
          .map((user) => user.id)
          .sort((a, b) => Number(a) - Number(b))
          .join(",");
        const key = `block-warning:${userId}:${roomId}:${ids}`;
        if (localStorage.getItem(key)) return;

        setBlockWarning({ key, users: blockedUsers });
      } catch (error) {
        console.error("Failed to load block warning:", error);
      }
    };

    loadBlockWarning();
  }, [roomId, userId]);

  // Participation check
  useEffect(() => {
    if (!userId || !roomId) return;
    const checkParticipation = async () => {
      try {
        setLoadingPost(true);
        const post = await getPost(roomId);
        setPostData(post);
        const isAuthor = String(post.user_id) === String(userId);
        const hasJoined = (post.joinedUserIds || [])
          .map(String)
          .includes(String(userId));
        setIsParticipant(isAuthor || hasJoined);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setPostData(null);
      } finally {
        setLoadingPost(false);
      }
    };
    checkParticipation();
  }, [roomId, userId]);

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

  // Scroll
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

  // Actions
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
      if (!socketRef.current.connected) {
        toast.error("채팅 서버에 연결되지 않았습니다.");
        return;
      }

      if (editId) {
        if (!input.trim()) return;
        socketRef.current.emit("edit_message", {
          messageId: editId,
          content: input,
          roomId,
          userId,
        });
        setEditId(null);
      } else {
        sendingRef.current = true;
        setSending(true);
        let clientTempId = createClientMessageId(); // Always create a temp ID
        try {
          const isUploadingMessage = pendingFiles.length > 0;
          // Add pending message state to UI
          setMessages((prev) => [
            ...prev,
            {
              id: clientTempId,
              clientTempId,
              roomId,
              userId,
              nickname: name,
              profileImg,
              content:
                input.trim() || (isUploadingMessage ? "파일 업로드 중..." : ""),
              isSystem: false,
              isPending: true,
              isUploading: isUploadingMessage,
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
          clearPendingFiles(); // Clear pending files immediately after creating temp message

          const content = await buildMessageContent(); // Build content, includes file uploads

          // Update message after content is built (e.g., if content changed from "uploading..." to actual JSON)
          if (clientTempId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientTempId === clientTempId
                  ? { ...m, content, isUploading: false }
                  : m,
              ),
            );
          }

          // Emit message via socket
          socketRef.current.emit(
            "send_message",
            {
              clientTempId,
              roomId,
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
        } catch (error) {
          // Fix for catch block
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
          clearPendingFiles(); // Clear files even on error
          sendingRef.current = false;
          setSending(false);
          return;
        }
        sendingRef.current = false;
        setSending(false);
      }
      setInput("");
      socketRef.current?.emit("stop_typing", { roomId });
      inputRef.current?.focus();
    },
    [
      input,
      pendingFiles.length,
      editId,
      roomId,
      userId,
      name,
      profileImg,
      replyTo,
      buildMessageContent,
      clearPendingFiles,
      setEditId,
      setInput,
      setReplyTo,
      setSending,
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
            roomId,
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
      roomId,
    });
    setShowEmojiPicker(null);
  };

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("[animation:highlightMessage_2s_ease-out]");
      setTimeout(() => el.classList.remove("[animation:highlightMessage_2s_ease-out]"), 2000);
    } else {
      toast.error("원본 메시지를 찾을 수 없습니다.");
    }
  };

  const toggleMembers = async () => {
    if (!showMembers) {
      try {
        const post = await getPost(roomId);
        const memberMap = new Map();
        const addMember = (member) => {
          if (!member?.user_id) return;
          memberMap.set(Number(member.user_id), member);
        };

        addMember(post.authorDetails);
        post.participantDetails?.forEach(addMember);
        if (userId && !memberMap.has(Number(userId))) {
          addMember({
            user_id: userId,
            nickname: name,
            profile_img: profileImg,
          });
        }
        setRoomMembers([...memberMap.values()]);
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

  const handleLeave = () => {
    toast("정말로 이 채팅방에서 나가시겠습니까?", {
      action: {
        label: "나가기",
        onClick: async () => {
          try {
            socketRef.current?.emit("leave_room", {
              roomId,
              nickname: name,
              userId,
            });
            await leavePost(roomId);
            toast.success("채팅방에서 나갔습니다.");
            navigate("/chat-rooms");
          } catch (err) {
            console.error("Failed to leave room:", err);
            toast.error("방 나가기에 실패했습니다.");
          }
        },
      },
      duration: 5000,
    });
  };

  const handleJoinChat = async () => {
    if (joining) return;
    setJoining(true);
    try {
      const updated = await togglePostJoin(roomId);
      if (updated) setPostData(updated);
      setIsParticipant(true);
    } catch (err) {
      console.error("Failed to join:", err);
      toast.error(err.response?.data?.message || "참여 처리에 실패했습니다.");
    } finally {
      setJoining(false);
    }
  };

  const handlePaste = (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length > 0) {
      e.preventDefault();
      addPendingFiles(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addPendingFiles(e.dataTransfer?.files);
  };

  const toggleNotifications = () => {
    const next = !notificationsMuted;
    setNotificationsMuted(next);
    localStorage.setItem(`chat-muted:${roomId}`, next ? "1" : "0");
    window.dispatchEvent(new Event("chat:refresh-unread"));
    toast.success(next ? "채팅방 알림을 껐습니다." : "채팅방 알림을 켰습니다.");
  };

  const openRoomMap = () => {
    const { place, latitude, longitude } = roomLocation || {};
    if (latitude && longitude) {
      window.open(
        `https://map.kakao.com/link/map/${encodeURIComponent(place || roomTitle)},${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    toast.error("연결된 장소 정보가 없습니다.");
  };

  const isFull =
    postData && (postData.participants || 1) >= (postData.capacity || 999);


  return {
    roomId, name, userId, profileImg, navigate, messages, input, setInput,
    roomTitle, setRoomTitle, roomImage, setRoomImage, roomAuthor,
    roomLocation, setRoomLocation, roomAppointment, setRoomAppointment,
    showSettings, setShowSettings, showMembers, setShowMembers, roomMembers,
    setRoomMembers, replyTo, editId, hoveredMsgId, setHoveredMsgId, showEmojiPicker,
    setShowEmojiPicker, showMainEmojiPicker, setShowMainEmojiPicker,
    showScrollBtn, showFileGallery, setShowFileGallery, notificationsMuted,
    sending, blockWarning, setBlockWarning, selectedProfileId,
    setSelectedProfileId, postData, isParticipant, joining, loadingPost,
    typingNickname, socketRef, bottomRef, messagesRef, inputRef, fileInputRef,
    typingEmitRef, pendingFiles, showAttachMenu, setShowAttachMenu,
    fileAccept, addPendingFiles, openFilePicker, removePendingFile,
    resizeInput, appointmentReminder, handleEmojiSelect, handleScroll,
    scrollToBottom, handleSend, startEdit, startReply, handleDelete,
    toggleReaction, scrollToMessage, toggleMembers, cancelContext,
    handleLeave, handleJoinChat, handlePaste, handleDrop,
    toggleNotifications, openRoomMap, isFull,
  };
}
