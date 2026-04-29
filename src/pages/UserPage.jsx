import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Userstyles = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
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
    color: var(--color-deactive);
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
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  if (!user) return <div>로딩 중...</div>;

  return (
    <Userstyles>
      <div className="profile-wrap">
        <div className="profile">
          {user.profile_img && (
            <img
              src={user.profile_img}
              alt="profile"
              style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            />
          )}
        </div>
        <div className="user-info">
          <h3>{user.nickname} 님</h3>
          <p>{user.email}</p>
          <div className="user-stats">
            <p>즐거운 모임 되세요!</p>
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
