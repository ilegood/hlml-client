import React, { useState } from "react";
import "./MessagePage.css";

export default function MessagePage() {
  const [activeChat, setActiveChat] = useState(0);
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! 이번 주말 농구 모임 참여 가능할까요?", isMe: false, time: "오후 2:30" },
    { id: 2, text: "네! 아직 자리 남아있습니다. 신청해 주세요!", isMe: true, time: "오후 2:31" },
    { id: 3, text: "알겠습니다. 지금 바로 신청할게요!", isMe: false, time: "오후 2:32" },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours() > 12 ? '오후' : '오전'} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setMessages([...messages, {
      id: Date.now(),
      text: inputText,
      isMe: true,
      time: timeStr
    }]);
    setInputText("");
  };

  const chats = [
    { name: "농구왕김코딩", lastMsg: "지금 바로 신청할게요!", color: "#FF6B6B" },
    { name: "카페투어리스트", lastMsg: "강남역 10번 출구 맞나요?", color: "#4D96FF" },
    { name: "보드게임매니아", lastMsg: "다음 모임은 언제인가요?", color: "#6BCB77" },
  ];

  return (
    <div className="message-layout">
      <div className="message-sidebar">
        <div className="sidebar-header">
          <h2>메시지</h2>
        </div>
        <div className="chat-list">
          {chats.map((chat, idx) => (
            <div 
              key={idx} 
              className={`chat-item ${activeChat === idx ? 'active' : ''}`} 
              onClick={() => setActiveChat(idx)}
            >
              <div className="avatar" style={{ backgroundColor: chat.color }}>
                {chat.name[0]}
              </div>
              <div className="chat-info">
                <div className="name">{chat.name}</div>
                <div className="preview">{chat.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="user-info">
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, backgroundColor: chats[activeChat].color }}>
              {chats[activeChat].name[0]}
            </div>
            {chats[activeChat].name}
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        <div className="message-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.isMe ? 'me' : ''}`}>
              {msg.text}
              <div className="time">{msg.time}</div>
            </div>
          ))}
        </div>

        <div className="input-section">
          <input 
            className="styled-input"
            placeholder="메시지를 입력하세요..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
