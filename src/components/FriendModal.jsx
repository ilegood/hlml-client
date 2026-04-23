import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const FriendCardStyles = styled.div`
  background: var(--color-sidebar);
  width: 300px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: center;

  .card-profile {
    width: 80px;
    height: 80px;
    background-color: var(--color-active);
    border-radius: 50%;
    margin-bottom: 15px;
  }

  h4 {
    margin-bottom: 5px;
  }

  p {
    font-size: 13px;
    color: var(--color-deactive);
    margin-bottom: 20px;
  }

  .memo-section {
    width: 100%;
    margin-top: 10px;
    border-top: 1px solid var(--color-border);
    padding-top: 15px;
  }

  textarea {
    width: 100%;
    height: 60px;
    background: var(--color-input-bg);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 10px;
    color: var(--color-text);
    resize: none;
    margin-bottom: 10px;
    font-size: 12px;

    &:focus {
      border-color: var(--color-active);
      outline: none;
    }
  }

  .btn-group {
    display: flex;
    gap: 8px;
    width: 100%;

    button {
      flex: 1;
      height: 32px;
      border-radius: 6px;
      border: none;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .save {
      background: var(--color-active);
      color: white;
    }

    .cancel {
      background: var(--color-border);
      color: var(--color-text);
    }
  }
`;

const FriendModal = ({ friend, onClose }) => {
  if (!friend) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <FriendCardStyles onClick={(e) => e.stopPropagation()}>
        <div className="card-profile"></div>
        <h4>{friend.name}</h4>
        <p>{friend.statusMessage || "상태 메시지가 없습니다."}</p>

        <div className="memo-section">
          <textarea placeholder="메모 남기기..." />
          <div className="btn-group">
            <button className="save">저장</button>
            <button className="cancel" onClick={onClose}>닫기</button>
          </div>
        </div>
      </FriendCardStyles>
    </ModalOverlay>
  );
};

export default FriendModal;
