import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// 서버 주소 확인 (4000 포트)
const socket = io("http://localhost:4000");

const ChatStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 25px);
  padding: 20px;
  background-color: var(--color-bg);

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 10px;
  }

  .message-wrapper { display: flex; flex-direction: column; max-width: 70%; }
  .sent { align-self: flex-end; align-items: flex-end; }
  .received { align-self: flex-start; align-items: flex-start; }

  .message {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .sent .message { background: var(--color-active); color: white; }

  .input-area {
    display: flex;
    gap: 10px;
    padding: 15px;
    margin-top: 10px;
  }

  input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
  button { background: var(--color-active); color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; }
`;

const ChatPage = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user] = useState({ id: Date.now(), nickname: `User_${Math.floor(Math.random()*100)}` });
  const scrollRef = useRef();

  useEffect(() => {
    console.log("채팅방 입장:", roomId);

    // 1. 기존 내역 가져오기
    fetch(`http://localhost:4000/api/chatting/${roomId}`)
      .then(r => r.json())
      .then(data => {
        console.log("기존 내역 로드 완료:", data.length, "개");
        setMessages(data);
      });

    // 2. 소켓 방 입장
    socket.emit("join_room", roomId);

    // 3. 메시지 수신 리스너
    const handleReceive = (msg) => {
      console.log("메시지 수신 성공!", msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const messageData = {
      room_id: roomId,
      user_id: user.id,
      nickname: user.nickname,
      message: input,
    };

    console.log("메시지 전송 시도:", messageData);

    // ★ 소켓으로 즉시 전송 ★
    socket.emit("send_message", messageData);

    // 백업: 서버 DB 저장을 위해 API도 한 번 쏴줍니다.
    fetch("http://localhost:4000/api/chatting/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData)
    }).catch(err => console.error("API 저장 실패(채팅은 소켓으로 진행중):", err));

    setInput("");
  };

  return (
    <ChatStyles>
      <div className="chat-header">
        <h3>방 번호: {roomId} | 내 이름: {user.nickname}</h3>
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.user_id === user.id ? "sent" : "received"}`}>
            <span style={{fontSize: '11px', color: '#888'}}>{m.nickname}</span>
            <div className="message">{m.message}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="input-area">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="여기에 메시지 입력..."
        />
        <button onClick={handleSend}>보내기</button>
      </div>
    </ChatStyles>
  );
};

export default ChatPage;
