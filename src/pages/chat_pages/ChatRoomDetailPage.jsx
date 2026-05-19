import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../../context/auth";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import { BASE_URL, getImageUrl } from "../../api/instance";
import { getRoomBlockWarning, uploadChatFile } from "../../api/chat";
import { leavePost, getPost } from "../../api/posts";
import { toast } from "sonner";
import styles from "./ChatRoomDetail.module.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { ChatMessageContent } from "../../components/chat_components/ChatAttachment";
import ChatFileGallery from "../../components/chat_components/ChatFileGallery";
import RoomSettingsModal from "../../components/RoomSettingsModal";
import ChatMembersModal from "../../components/ChatMembersModal";
import UserProfileModal from "../../components/modals/UserProfileModal";
import borderImg from "../../assets/border.png";
import { formatChatPreview } from "../../utils/chatPreview";

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────
// ... (helper functions - formatTime, formatDate, isSameDay, isCompact, createPendingFileId, formatAppointmentDateTime, displayName, Avatar)

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

const createPendingFileId = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${
    crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
  }`;

const createClientMessageId = () =>
  `client-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

const formatAppointmentDateTime = (date, time) => {
  const dateText = date
    ? new Date(date).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })
    : "";
  const timeText = time ? String(time).slice(0, 5) : "";
  return [dateText, timeText].filter(Boolean).join(" ");
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
        {url ? <img src={url} alt={label} /> : label.slice(0, 2)}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

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

  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
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
    () => localStorage.getItem(`chat-muted:${roomId}`) === "1",
  );
  const [sending, setSending] = useState(false);
  const [blockWarning, setBlockWarning] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingFilesRef = useRef([]);
  const notificationsMutedRef = useRef(notificationsMuted);
  const appointmentReminder = (notifications?.reminders || []).find(
    (item) => String(item.roomId) === String(roomId),
  );

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    notificationsMutedRef.current = notificationsMuted;
  }, [notificationsMuted]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

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

    socket.on("room_info", ({ title, image, author, place, latitude, longitude }) => {
      setRoomTitle(title);
      setRoomImage(image);
      setRoomAuthor(author);
      setRoomLocation({
        place,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });
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
  }, [roomId, userId, name, navigate]);

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

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const addPendingFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    setPendingFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: createPendingFileId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [fileInputRef, inputRef]); // Add dependencies

  const openFilePicker = useCallback((accept) => {
    setFileAccept(accept);
    setShowAttachMenu(false);
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  }, [setFileAccept, setShowAttachMenu]);

  const removePendingFile = useCallback((id) => {
    setPendingFiles((prev) => {
      const next = [];
      prev.forEach((item) => {
        if (item.id === id) URL.revokeObjectURL(item.previewUrl);
        else next.push(item);
      });
      return next;
    });
  }, []);

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
        setSending(true);
        let clientTempId = null;
        try {
          clientTempId = createClientMessageId();
          const isUploadingMessage = pendingFiles.length > 0;
          setMessages((prev) => [
            ...prev,
            {
              id: clientTempId,
              clientTempId,
              roomId,
              userId,
              nickname: name,
              profileImg,
              content: isUploadingMessage ? "파일 업로드 중..." : input.trim(),
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
          const content = await buildMessageContent();
          setMessages((prev) =>
            prev.map((m) =>
              m.clientTempId === clientTempId
                ? { ...m, content, isUploading: false }
                : m,
            ),
          );
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
              if (!res?.ok) {
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
        } catch (error) {
          if (clientTempId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.clientTempId === clientTempId
                  ? { ...m, isPending: false, isUploading: false, isFailed: true }
                  : m,
              ),
            );
          }
          console.error("Failed to upload chat file:", error);
          toast.error(
            error?.response?.data?.message || "파일 업로드에 실패했습니다.",
          );
          setSending(false);
          return;
        }
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={styles.chatWrap}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {blockWarning && (
        <div className={styles.warningOverlay}>
          <div className={styles.warningModal}>
            <h3>차단한 사용자가 이 채팅방에 있습니다.</h3>
            <p>
              {blockWarning.users.map((user) => displayName(user.nickname)).join(", ")}님이
              현재 이 그룹 채팅방에 참여 중입니다.
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

      {appointmentReminder && (
        <div className={styles.appointmentReminderBar}>
          <div className={styles.appointmentReminderIcon}>30</div>
          <div className={styles.appointmentReminderText}>
            <strong>{appointmentReminder.title || roomTitle || "약속"}</strong>
            <span>
              약속이 30분 이내에 시작됩니다.
              {formatAppointmentDateTime(
                appointmentReminder.date,
                appointmentReminder.time,
              ) && ` ${formatAppointmentDateTime(appointmentReminder.date, appointmentReminder.time)}`}
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

      {/* ── Message list ── */}
      <div
        className={styles.messages}
        ref={messagesRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
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
            return (
              <div key={msg.id || idx}>
                {showDateDivider && (
                  <div className={styles.dateDivider}>
                    <span className={styles.dateDividerText}>
                      {formatDate(msg.time)}
                    </span>
                  </div>
                )}
                <div className={msg.isDeletionWarning ? styles.deletionWarningMsg : styles.systemMsg}>{msg.content}</div>
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
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 2 0 0 1 1 1v2" />
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
                  onClick={() => removePendingFile(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
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
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
          onUpdate={() => {
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
