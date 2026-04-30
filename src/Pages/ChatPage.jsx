import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import ChatHeader from "../Components/Chat/ChatHeader";
import MessageList from "../Components/Chat/MessageList";
import MessageInput from "../Components/Chat/MessageInput";
import ImagePreviewModal from "../Components/Chat/ImagePreviewModal";
import { ChatStyles } from "./ChatPage.styles";

const SERVER_URL = `http://${window.location.hostname}:4000`;
const socket = io(SERVER_URL);

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [navigate]);

  useEffect(() => {
    if (!roomId || !user) return;

    setIsJoined(false);
    setRoomInfo(null);

    fetch(`${SERVER_URL}/api/chatting/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("채팅 내역 로드 실패:", err));

    socket.emit("join_room", {
      roomId,
      nickname: user.nickname,
      userId: user.id,
    });

    const handleRoomInfo = (info) => {
      setRoomInfo(info);
      setIsJoined(true);
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleRoomFull = ({ maxCapacity }) => {
      setIsJoined(false);
      alert(`정원이 초과되었습니다. (최대 ${maxCapacity}명)`);
      navigate(-1);
    };

    const handleErrorMessage = (msg) => {
      setIsJoined(false);
      alert(msg);
      navigate(-1);
    };

    const handleRoomDeleted = () => {
      setIsJoined(false);
      alert("채팅방이 삭제되었습니다.");
      navigate("/chatrooms");
    };

    socket.on("room_info", handleRoomInfo);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("room_full", handleRoomFull);
    socket.on("error_message", handleErrorMessage);
    socket.on("room_deleted", handleRoomDeleted);

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("room_info", handleRoomInfo);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("room_full", handleRoomFull);
      socket.off("error_message", handleErrorMessage);
      socket.off("room_deleted", handleRoomDeleted);
    };
  }, [roomId, user, navigate]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if ((!input.trim() && !preview) || !user || !isJoined) return;

    const messageData = {
      room_id: roomId,
      user_id: user.id,
      nickname: user.nickname,
      message: input,
      image: preview,
    };

    socket.emit("send_message", messageData);

    setInput("");
    setImage(null);
    setPreview(null);
  };

  const handleDeleteRoom = async () => {
    if (!user || user.nickname !== roomInfo?.author) return;
    if (!window.confirm("이 채팅방을 삭제할까요?")) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: user.nickname }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "채팅방 삭제에 실패했습니다.");
        return;
      }

      navigate("/chatrooms");
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <ChatStyles>
      <ChatHeader
        roomId={roomId}
        nickname={user.nickname}
        host={roomInfo?.author}
        canDelete={user.nickname === roomInfo?.author}
        onDelete={handleDeleteRoom}
      />

      <MessageList messages={messages} user={user} />

      <ImagePreviewModal
        preview={preview}
        setPreview={setPreview}
        setImage={setImage}
        handleSend={handleSend}
      />

      <MessageInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        disabled={!isJoined}
      />
    </ChatStyles>
  );
};

export default ChatPage;
