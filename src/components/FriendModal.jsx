import styled from "styled-components";

const FriendCardStyles = styled.div`
  position: fixed;
`;

const FriendModal = () => {
  return (
    <FriendCardStyles>
      <div onClick={onclose}>
        <div className="card" onClick={(e) => e.stopPropagation()}>
          <div className="card-profile"></div>
          <h4>이름</h4>
          <p>상태 메세지</p>

          <div className="memo"></div>
          <button>메모 추가</button>

          <div className="memo-input">
            <textarea placeholder="메모 남기기..." />
            <button>저장</button>
            <button>취소</button>
          </div>
        </div>
      </div>
    </FriendCardStyles>
  );
};

export default FriendModal;
