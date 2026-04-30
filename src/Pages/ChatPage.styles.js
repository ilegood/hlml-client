import styled from "styled-components";

export const ChatStyles = styled.div`
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

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
  }

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
