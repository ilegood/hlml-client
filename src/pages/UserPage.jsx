import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ProfileEditModal from "../components/ProfileEditModal";

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
    border-bottom: 2px solid var(--color-border);
  }

  .profile {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #ffffff;
    border: 1px solid var(--color-border);
    margin-right: 25px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 200px;
    color: var(--color-text);
  }

  .user-info h3 {
    margin: 0;
  }

  .user-info .email {
    margin: 0;
    font-size: 13px;
    color: var(--color-deactive);
  }

  .user-info .bio {
    margin: 5px 0 0;
    font-size: 14px;
    color: var(--color-text);
    opacity: 0.8;
  }

  .user-stats {
    display: flex;
    gap: 16px;
    margin-top: 10px;
  }

  .user-stats p {
    margin: 0;
    font-size: 14px;
    color: var(--color-text);
  }

  .edit {
    width: 100px;
    height: 35px;
    border-radius: 50px;
    border: none;
    background-color: var(--color-active);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  .profile-util {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 50px 100px;
  }

  .util {
    width: 200px;
    height: 200px;
    background-color: var(--color-sidebar);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    color: var(--color-text);
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-6px);
      background-color: var(--color-active);
      color: white;
      border-color: var(--color-active);
    }
  }
`;

const UserPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("name") || "닉네임",
    email: localStorage.getItem("email") || "이메일 정보 없음",
    bio: localStorage.getItem("bio") || "소개 없음",
    profile_img: localStorage.getItem("profile_img") || "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const refreshUserInfo = () => {
    setUserInfo({
      name: localStorage.getItem("name") || "닉네임",
      email: localStorage.getItem("email") || "이메일 정보 없음",
      bio: localStorage.getItem("bio") || "소개 없음",
      profile_img: localStorage.getItem("profile_img") || "",
    });
  };

  return (
    <Userstyles>
      <div className="profile-wrap">
        <div className="profile">
          {userInfo.profile_img && (
            <img 
              src={`http://localhost:4000${userInfo.profile_img}`} 
              alt="profile" 
            />
          )}
        </div>
        <div className="user-info">
          <h3>{userInfo.name} 님</h3>
          <p className="email">{userInfo.email}</p>
          <p className="bio">{userInfo.bio}</p>
          <div className="user-stats">
            <p>약속 성공 0번</p>
            <p>실패 0번</p>
            <p>게시물 0개</p>
          </div>
        </div>
        <button className="edit" onClick={() => setIsModalOpen(true)}>수정</button>
      </div>

      {isModalOpen && (
        <ProfileEditModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={refreshUserInfo}
        />
      )}

      <div className="profile-util">
        <button className="util">찜 목록</button>
        <button className="util">올린 게시글</button>
        <button className="util">내 약속 관리</button>
        <button className="util">차단 목록</button>
        <button className="util">신고</button>
        <button className="util">고객센터</button>
      </div>
    </Userstyles>
  );
};

export default UserPage;
