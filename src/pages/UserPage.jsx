import styled from "styled-components";

const Userstyles = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 25px);

  .profile-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 3px solid #d6d6d6;
  }

  .profile {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: var(--color-active);
  }

  .edit {
    width: 100px;
    height: 30px;
    border-radius: 50px;
  }

  .profile-util {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }

  .util {
    width: 200px;
    height: 200px;
    background-color: var(--color-bg);
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const UserPage = () => {
  return (
    <Userstyles>
      <div className="profile-wrap">
        <div className="profile"></div>
        <div className="user-info">
          <h3>닉네임 님</h3>
          <p>이메일</p>
          <p>약속 성공 30번</p>
          <p>실패 2번</p>
          <p>게시물 32개</p>
        </div>
        <button className="edit">수정</button>
      </div>
      <div className="profile-util">
        <button className="util">찜 목록</button>
        <button className="util">올린 게시글</button>
        <button className="util">친구 목록</button>
        <button className="util">차단 목록</button>
        <button className="util">신고</button>
        <button className="util">고객센터</button>
      </div>
    </Userstyles>
  );
};
export default UserPage;
