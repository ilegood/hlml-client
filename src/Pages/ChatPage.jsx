import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// 서버 주소 확인 (4000 포트)
const SERVER_URL = `http://${window.location.hostname}:4000`;
const socket = io(SERVER_URL);

const ChatStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 25px);
  padding: 20px;
  background-color: var(--color-bg);

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 15px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 80%;
  }

  .system-message {
    align-self: center;
    background: #f0f0f0;
    color: #888;
    font-size: 12px;
    padding: 5px 15px;
    border-radius: 20px;
    margin: 10px 0;
    text-align: center;
  }

  .sent {
    align-self: flex-end;
    align-items: flex-end;
  }

  .received {
    align-self: flex-start;
    align-items: flex-start;
  }

  .nickname {
    font-size: 11px;
    color: #888;
    margin-bottom: 2px;
  }

  .message {
    padding: 10px 14px;
    border-radius: 15px;
    font-size: 14px;
    background: #f0f0f0;
    color: #333;
    line-height: 1.4;
    word-break: break-all;
  }

  .sent .message {
    background: var(--color-active);
    color: white;
    border-bottom-right-radius: 2px;
  }

  .received .message {
    background: #e9e9eb;
    border-bottom-left-radius: 2px;
  }

  .chat-image {
    max-width: 100%;
    max-height: 250px;
    border-radius: 8px;
    margin-bottom: 5px;
  }

  .time {
    font-size: 10px;
    color: #bbb;
    margin-top: 2px;
  }

  .input-area {
    display: flex;
    gap: 10px;
    padding: 15px 0;
    margin-top: 10px;
  }

  input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 25px;
    outline: none;
    font-size: 14px;
  }

  input:focus {
    border-color: var(--color-active);
  }

  button {
    background: var(--color-active);
    color: white;
    border: none;
    padding: 0 25px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    opacity: 0.9;
  }

  /* 이미지 미리보기 모달 (설정 창) */
  .image-preview-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 90%;
    max-width: 400px;
  }
  .preview-img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 10px;
  }
  .modal-btns {
    display: flex;
    gap: 10px;
    width: 100%;
  }
`;

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // 전송할 이미지 데이터
  const [preview, setPreview] = useState(null); // 미리보기 URL
  const [user, setUser] = useState(null);
  const scrollRef = useRef();
  const fileInputRef = useRef();

  // 1. 사용자 정보 확인 (로그인 여부)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  // 2. 채팅방 입장 및 소켓 설정
  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`${roomId}번 방 입장 시도...`);

    // 기존 내역 가져오기 (REST API)
    fetch(`${SERVER_URL}/api/chatting/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("채팅 내역 로드 실패:", err));

    // 소켓 방 입장 (닉네임 포함)
    socket.emit("join_room", {
      roomId,
      nickname: user.nickname,
      userId: user.id,
    });

    // 메시지 수신 리스너
    const handleReceiveMessage = (msg) => {
      console.log("새 메시지 수신:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [roomId, user]);

  // 3. 스크롤 하단 유지
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 이미지 파일 선택 처리
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !preview) || !user) return;

    const messageData = {
      room_id: roomId,
      user_id: user.id,
      nickname: user.nickname,
      message: input,
      image: preview, // base64 이미지 포함
    };

    console.log("메시지 전송:", messageData);

    // 소켓으로 메시지 전송
    socket.emit("send_message", messageData);

    setInput("");
    setImage(null);
    setPreview(null);
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <ChatStyles>
      <div className="chat-header">
        <h3>방 번호: {roomId}</h3>
        <span style={{ fontSize: "13px", color: "#666" }}>
          {user.nickname}님 접속 중
        </span>
      </div>

      <div className="messages">
        {messages.map((m, i) => {
          // 시스템 메시지 처리
          if (m.isSystem || m.is_system) {
            return (
              <div key={m.id || i} className="system-message">
                {m.message}
              </div>
            );
          }

          // user_id가 숫자와 문자열로 섞일 수 있으므로 Number()로 타입을 맞춤
          const isMe =
            (m.user_id && Number(m.user_id) === Number(user.id)) ||
            m.nickname === user.nickname;

          const time = m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={m.id || i}
              className={`message-wrapper ${isMe ? "sent" : "received"}`}
            >
              {!isMe && <span className="nickname">{m.nickname}</span>}
              {m.image && (
                <img src={m.image} alt="chat" className="chat-image" />
              )}
              <div className="message">{m.message}</div>
              <span className="time">{time}</span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* 이미지 미리보기 모달 (설정 창) */}
      {preview && (
        <div className="image-preview-modal">
          <h4>이미지 전송 설정</h4>
          <img src={preview} alt="Preview" className="preview-img" />
          <div className="modal-btns">
            <button
              onClick={() => {
                setPreview(null);
                setImage(null);
              }}
              style={{ background: "#ccc", flex: 1 }}
            >
              취소
            </button>
            <button onClick={handleSend} style={{ flex: 1 }}>
              전송하기
            </button>
          </div>
        </div>
      )}

      <div className="input-area">
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={onFileChange}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          style={{ padding: "0 15px", background: "#f0f0f0", color: "#333" }}
        >
          +
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSend}>보내기</button>
      </div>
    </ChatStyles>
  );
};

export default ChatPage;
