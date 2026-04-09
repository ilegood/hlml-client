import styled from "styled-components";

const ChatStyles = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 25px);
  padding: 20px;
  background-color: var(--color-bg);

  .chat-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;

    h2 {
      margin: 0;
      color: var(--color-active);
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px;
    margin-bottom: 20px;
  }

  .message {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.4;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .received {
    background-color: white;
    align-self: flex-start;
    border: 1px solid #f0f0f0;
  }

  .sent {
    background-color: var(--color-active);
    color: white;
    align-self: flex-end;
  }

  .input-area {
    display: flex;
    gap: 10px;
    padding: 15px;
    background: white;
    border-radius: 12px;
    border: 1.5px solid #eee;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
  }

  button {
    background-color: var(--color-active);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }
`;

const ChatPage = () => {
  return (
    <ChatStyles>
      <div className="chat-header">
        <h2>채팅방</h2>
      </div>
      <div className="messages">
        <div className="message received">안녕하세요! 반가워요.</div>
        <div className="message sent">
          네, 안녕하세요! 채팅방 테스트 중입니다.
        </div>
        <div className="message received">디자인이 깔끔하네요!</div>
      </div>
      <div className="input-area">
        <input type="text" placeholder="메시지를 입력하세요..." />
        <button>전송</button>
      </div>
    </ChatStyles>
  );
};

export default ChatPage;
