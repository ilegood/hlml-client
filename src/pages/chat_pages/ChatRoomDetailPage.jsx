import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { BASE_URL, getImageUrl } from "../../api/instance";
import { getRoomBlockWarning } from "../../api/chat";
import { leavePost, getPost, togglePostJoin } from "../../api/posts";
import { getRoomBlockWarning, uploadChatFile } from "../../api/chat";
import { leavePost, getPost } from "../../api/posts";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  ChatMessageContent,
  MessageRowErrorBoundary,
} from "../../components/chat_components/ChatAttachment";
import ChatFileGallery from "../../components/chat_components/ChatFileGallery";
import RoomSettingsModal from "../../components/RoomSettingsModal";
import ChatMembersModal from "../../components/ChatMembersModal";
import UserProfileModal from "../../components/modals/UserProfileModal";
import ChatInputArea from "../../components/chat_components/ChatInputArea";
import { useFileUpload } from "../../hooks/useFileUpload";

import { formatChatPreview } from "../../utils/chatPreview";
import {
  formatAppointmentDateTime,
  formatTime,
  formatDate,
  isSameDay,
  isCompact,
  displayName,
  createClientMessageId,
} from "../../utils/chatHelpers";
import borderImg from "../../assets/border.png";
import MapPreview from "../../components/post_components/MapPreview";
import borderImg from "../../assets/border.png";
import { formatChatPreview } from "../../utils/chatPreview";
import { usePendingChatFiles } from "../../hooks/usePendingChatFiles";

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────
// ... (helper functions - formatTime, formatDate, isSameDay, isCompact, formatAppointmentDateTime, displayName, Avatar)
const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
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

  const options = {
    month: "long",
    day: "numeric",
  };
  if (d.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }

  return d.toLocaleDateString("ko-KR", options);
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

const createClientMessageId = () =>
  `client-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

const formatAppointmentDateTime = (date, time) => {
  const now = new Date();
  const apptDate = new Date(date);
  const options = {
    month: "long",
    day: "numeric",
  };
  if (apptDate.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  const dateText = date ? apptDate.toLocaleDateString("ko-KR", options) : "";
  const timeText = time ? String(time).slice(0, 5) : "";
  return [dateText, timeText].filter(Boolean).join(" ");
};

const normalizeRoomAppointment = (info = {}) => ({
  date: info.date || "",
  time: info.time || "",
  place: info.place || "",
  latitude: info.latitude ? Number(info.latitude) : null,
  longitude: info.longitude ? Number(info.longitude) : null,
  capacity: Number(info.capacity) || 0,
  participants: Number(info.participants) || 0,
  status: info.status || "",
});

const parseSystemMessagePayload = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    return parsed?.kind === "appointment_change" ? parsed : null;
  } catch {
    return null;
  }
};

const displayName = (nickname) => nickname || "이름 없음";

// ── Avatar 컴포넌트 ────────────────────────────────────────────────────────────

function Avatar({ profileImg, nickname, isHost, size = 40, onClick }) {
  const url = getImageUrl(profileImg);
  const label = displayName(nickname);
  return (
    <div 
      className={styles.avatarWrapSmall} 
      onClick={onClick} 
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
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
        {url ? <img src={url} alt={label} style={{ backgroundColor: "white" }} /> : label.slice(0, 2)}
      </div>
    </div>
  );
}

export default function ChatRoomDetailPage() {
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

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
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

    if (!isParticipant) return;

    socketRef.current = io(BASE_URL, {
      auth: { token: localStorage.getItem("token") },
      reconnectionAttempts: 5,
    });
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join_room", { roomId, nickname: name, userId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err);
      toast.error("채팅 서버 연결에 실패했습니다.");
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        // 중복 방지 (이미 목록에 있는 메시지면 무시)
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
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

    return () => socket.disconnect();
  }, [roomId, userId, name, navigate, isParticipant]);

  useEffect(() => {
    if (!userId || !roomId) return;

    const loadBlockWarning = async () => {
      try {
        // Ensure roomId is only the numeric part, in case it contains extra path segments
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

  // ── Participation check ──
  useEffect(() => {
    if (!userId || !roomId) return;
    const checkParticipation = async () => {
      try {
        setLoadingPost(true);
        const post = await getPost(roomId);
        setPostData(post);
        const isAuthor = String(post.user_id) === String(userId);
        const hasJoined = (post.joinedUserIds || []).map(String).includes(String(userId));
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
    setInput(
      text.substring(0, start) +
        emoji.native +
        text.substring(end, text.length),
    );
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
    setShowScrollBtn(
      container.scrollHeight - container.scrollTop >
        container.clientHeight + 200,
    );
    const isUp =
      container.scrollHeight - container.scrollTop >
      container.clientHeight + 200;
    setShowScrollBtn(isUp);
  };

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // ── Actions ─────────────────────────────────────────────────────────────────

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
                roomId,
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
                  ? { ...m, isPending: false, isUploading: false, isFailed: true }
                  : m,
              ),
            );
          }
          console.error("Failed to upload chat file:", error);
          toast.error(
            error?.response?.data?.message || "파일 업로드에 실패했습니다.",
          );
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
            socketRef.current?.emit("leave_room", { roomId, nickname: name, userId });
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

  const isFull = postData && (postData.participants || 1) >= (postData.capacity || 999);

  if (loadingPost) {
    return (
      <div className={styles.chatWrap}>
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <p style={{ textAlign: "center" }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className={styles.chatWrap}>
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <h3>게시글을 찾을 수 없습니다.</h3>
            <p>존재하지 않거나 삭제된 게시글입니다.</p>
            <button type="button" onClick={() => navigate(-1)}>뒤로 가기</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className={styles.chatWrap}>
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <h2 style={{ marginTop: 0 }}>{postData.title}</h2>
            {(postData.date || postData.time) && (
              <p style={{ margin: "4px 0", color: "#888" }}>
                📅 {postData.date || ""} {postData.time?.slice(0, 5) || ""}
              </p>
            )}
            {postData.place && (
              <p style={{ margin: "4px 0", color: "#888" }}>📍 {postData.place}</p>
            )}
            <p style={{ margin: "4px 0", color: "#888" }}>
              👥 {postData.participants || 1}/{postData.capacity || "∞"}
            </p>
            {postData.content && (
              <p
                style={{
                  margin: "12px 0",
                  padding: "10px",
                  background: "var(--color-input-bg)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  maxHeight: "80px",
                  overflow: "hidden",
                }}
              >
                {postData.content}
              </p>
            )}
            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "16px 0" }} />
            <h3 style={{ margin: "0 0 16px" }}>참여하겠습니까?</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleJoinChat}
                disabled={joining || isFull}
                style={{
                  flex: 1,
                  height: 40,
                  border: "none",
                  borderRadius: 6,
                  background: isFull ? "#888" : "var(--color-active)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isFull ? "default" : "pointer",
                }}
              >
                {joining ? "참여 중..." : isFull ? "정원이 가득 찼습니다" : "참여하기"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  flex: 1,
                  height: 40,
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--color-text)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.chatWrap}
      onDrop={(e) => handleDrop(e, addPendingFiles)}
      onDragOver={(e) => e.preventDefault()}
    >
      {blockWarning && (
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <h3>차단한 사용자가 이 채팅방에 있습니다.</h3>
            <p>
              {blockWarning.users
                .map((user) => displayName(user.nickname))
                .join(", ")}
              님이 현재 이 그룹 채팅방에 참여 중입니다.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(blockWarning.key, "1");
                setBlockWarning(null);
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
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
          <button
            className={styles.headerIconBtn}
            title={notificationsMuted ? "채팅 알림 켜기" : "채팅 알림 끄기"}
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
            title="지도보기"
            style={{ display: "none" }}
            onClick={openRoomMap}
          >
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

      <section className={styles.appointmentCard}>
        <div className={styles.appointmentCardMain}>
          <div className={styles.appointmentCardLabel}>약속 정보</div>
          <strong>{roomTitle || `채팅방 ${roomId}`}</strong>
          <span>
            {formatAppointmentDateTime(roomAppointment.date, roomAppointment.time) ||
              "날짜와 시간이 정해지지 않았습니다."}
          </span>
        </div>
        <div className={styles.appointmentCardMeta}>
          <div>
            <span>장소</span>
            <strong>{roomAppointment.place || "미정"}</strong>
          </div>
          <div>
            <span>참석</span>
            <strong>
              {roomAppointment.participants || 0}
              {roomAppointment.capacity ? ` / ${roomAppointment.capacity}` : ""}명
            </strong>
          </div>
          <div>
            <span>상태</span>
            <strong>{roomAppointment.status || "확인 중"}</strong>
          </div>
        </div>
        <button type="button" className={styles.appointmentCardMapBtn} onClick={openRoomMap}>
          위치 보기
        </button>
      </section>

      {appointmentReminder && (
        <div className={styles.appointmentReminderBar}>
          <div className={styles.appointmentReminderIcon}>⏰</div>
          <div className={styles.appointmentReminderText}>
            <strong>{appointmentReminder.title || roomTitle || "약속"}</strong>
            <span>
              약속이 30분 이내에 시작됩니다.
              {formatAppointmentDateTime(
                appointmentReminder.date,
                appointmentReminder.time,
              ) &&
                ` ${formatAppointmentDateTime(appointmentReminder.date, appointmentReminder.time)}`}
              {appointmentReminder.place && ` · ${appointmentReminder.place}`}
            </span>
          </div>
          <button
            type="button"
            className={styles.appointmentReminderAction}
            onClick={openRoomMap}
          >
            위치 보기
          </button>
        </div>
      )}

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
          const parentMsg = msg.parentId ? messages.find((m) => m.id === msg.parentId) : null;
          const msgNickname = displayName(msg.nickname);
          const msgNickname = displayName(msg.nickname);
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
            let systemText = msg.content;
            let parsed = null;
            try {
              parsed = JSON.parse(msg.content);
              if (parsed?.kind === "share_post") {
                const sharer = parsed.sharerNickname || "알 수 없음";
                const title = parsed.postTitle || "게시글";
                systemText = `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
              }
            } catch { /* not JSON */ }
            const systemPayload = parseSystemMessagePayload(msg.content);
            const systemText = systemPayload?.text || msg.content;
            const hasMap =
              systemPayload?.kind === "appointment_change" &&
              systemPayload.showMap &&
              Number.isFinite(systemPayload.latitude) &&
              Number.isFinite(systemPayload.longitude);

            return (
              <div key={msg.id || idx}>
                {showDateDivider && (
                  <div className={styles.dateDivider}>
                    <span className={styles.dateDividerText}>{formatDate(msg.time)}</span>
                  </div>
                )}
                <div className={styles.systemMsg}>{systemText}</div>
                {parsed?.kind === "share_post" && (
                  <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat-rooms/${parsed.postId}`)}
                      style={{
                        height: 32,
                        padding: "0 16px",
                        border: "none",
                        borderRadius: 6,
                        background: "var(--color-active)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      참여하기
                    </button>
                  </div>
                )}
                    <span className={styles.dateDividerText}>
                      {formatDate(msg.time)}
                    </span>
                  </div>
                )}
                <div
                  className={
                    msg.isDeletionWarning
                      ? styles.deletionWarningMsg
                      : styles.systemMsg
                  }
                >
                  <span>{systemText}</span>
                  {hasMap && (
                    <div className={styles.systemMsgMap}>
                      <MapPreview
                        latitude={systemPayload.latitude}
                        longitude={systemPayload.longitude}
                      />
                    </div>
                  )}
                </div>
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
                      nickname={msgNickname}
                      isHost={msgNickname === roomAuthor}
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
                        {msgNickname}
                      </span>
                      {msgNickname === roomAuthor && (
                        <span className={styles.msgHostBadge}>방장</span>
                      )}
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
                            alt={displayName(parentMsg.nickname)}
                          />
                        ) : (
                          displayName(parentMsg.nickname).slice(0, 1)
                        )}
                      </div>
                      <span className={styles.replyName}>
                        {displayName(parentMsg.nickname)}
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
        roomTitle={roomTitle}
        roomId={roomId}
        formatChatPreview={formatChatPreview}
        messages={messages}
      />
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
                  {displayName(replyTo.nickname)}님에게 답장 중
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
                : formatChatPreview(messages.find((m) => m.id === editId)?.content)}
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
                {pendingFiles.some((item) => item.file.type.startsWith("image/"))
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
              <button type="button" onClick={() => openFilePicker("image/*,video/*")}>
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
            onChange={(e) => setInput(e.target.value)}
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
                  ? `@${displayName(replyTo.nickname)}님에게 답장...`
                  : `#${roomTitle || roomId}에 메시지 보내기`
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

      {showSettings && (
        <RoomSettingsModal
          roomId={roomId}
          onClose={() => setShowSettings(false)}
          onUpdate={(updatedPost) => {
            if (updatedPost) {
              setRoomTitle(updatedPost.title || roomTitle);
              setRoomImage(updatedPost.image || "");
              setRoomLocation({
                place: updatedPost.place || "",
                latitude: updatedPost.latitude ? Number(updatedPost.latitude) : null,
                longitude: updatedPost.longitude ? Number(updatedPost.longitude) : null,
              });
              setRoomAppointment(normalizeRoomAppointment(updatedPost));
            }
            socketRef.current?.emit("join_room", {
              roomId,
              nickname: name,
              userId,
            });
          }}
        />
      )}

      {showFileGallery && (
        <ChatFileGallery
          messages={messages}
          onClose={() => setShowFileGallery(false)}
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
          setRoomMembers((prev) =>
            prev.filter(
              (member) => Number(member.user_id) !== Number(target.user_id),
            ),
            prev.filter((member) => Number(member.user_id) !== Number(target.user_id)),
          );
        }}
      />

      {selectedProfileId && (
        <UserProfileModal
          userId={selectedProfileId}
          currentUserId={userId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}
    </div>
  );
}
