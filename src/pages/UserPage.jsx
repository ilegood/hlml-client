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
    width: 100%;
    padding-bottom: 50px;
    margin-bottom: 50px;
    border-bottom: 2px solid #d6d6d6;
  }

  .profile {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: var(--color-active);
    margin-right: 25px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 200px;
  }

  .user-info h3 {
    margin: 0;
  }

  .user-info > p {
    margin: 0;
    font-size: 12px;
  }

  .user-stats {
    display: flex;
    gap: 16px;
    margin-top: 6px;
  }

  .user-stats p {
    margin: 0;
    font-size: 14px;
  }

  .edit {
    width: 100px;
    height: 30px;
    border-radius: 50px;
    border: none;
    background-color: var(--color-active);
    color: white;
    cursor: pointer;
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .edit:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  .profile-util {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 50px 100px;
  }

  .util {
    width: 200px;
    height: 200px;
    background-color: var(--color-deactive);
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
    color: white;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition:
      transform 0.2s,
      background-color 0.2s;
  }

  .util:hover {
    transform: translateY(-6px);
    background-color: var(--color-active);
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
          <div className="user-stats">
            <p>약속 성공 30번</p>
            <p>실패 2번</p>
            <p>게시물 32개</p>
          </div>
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
