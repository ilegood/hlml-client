import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import styled from "styled-components";

// 이미지 임포트
import logoImg from "../assets/logo.png";
import dashboardImg from "../assets/dashboard.png";
import homeImg from "../assets/home.png";
import postImg from "../assets/post.png";
import messageImg from "../assets/message.png";
import profileImg from "../assets/profile.png";
import darkImg from "../assets/dark.png";
import logoutImg from "../assets/logout.png";
import loginImg from "../assets/login.png";

const SidebarStyles = styled.div`
  width: 70px;
  padding: 30px 0;
  background-color: var(--color-sidebar);
  box-shadow: 5px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s ease;
  left: 0;
  position: fixed;
  top: 25px;
  height: calc(100vh - 25px);
  z-index: 1000;

  &:hover {
    width: 260px;
  }

  /* 메뉴 아이템 공통 스타일 */
  .item-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    height: 54px;
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    /* 중앙 정렬을 위한 패딩 계산: (사이드바너비 70px - 아이콘 24px) / 2 = 23px */
    padding-left: 23px;
    transition:
      padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.2s ease;
    gap: 20px;
    color: var(--color-deactive);
  }

  /* 로고는 약간 더 큼 (30px) */
  .logo {
    padding-left: 20px;
    margin-bottom: 25px;
    img {
      width: 30px;
      height: 30px;
    }
  }

  &:hover .item-wrap {
    padding-left: 25px; /* 확장 시 왼쪽으로 살짝 이동하며 자리 잡음 */
  }

  .item-wrap:hover {
    background-color: color-mix(in srgb, var(--color-active) 10%, transparent);
    color: var(--color-active);
  }

  img {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .label {
    opacity: 0;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 500;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  &:hover .label {
    opacity: 1;
    pointer-events: auto;
  }

  .logo .label {
    color: var(--color-active);
    font-size: 20px;
    font-weight: 800;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 다크모드 스위치 영역 전용 */
  .switch-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 20px;
  }

  .slider {
    position: relative;
    width: 38px;
    height: 20px;
    background: var(--color-active);
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.2s ease;

    &::before {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      left: 3px;
      top: 3px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      transform: ${(props) =>
        props.$isDark ? "translateX(18px)" : "translateX(0)"};
    }
  }

  &:hover .slider {
    opacity: 1;
  }

  /* 로그아웃 버튼 */
  .logout-btn {
    background-color: var(--color-active);
    margin: 10px 10px;
    width: calc(100% - 20px);
    height: 48px;
    border-radius: 12px;
    padding-left: 0;
    justify-content: center;
    color: white;
    gap: 0;

    .label {
      color: white;
      margin-left: 0;
      width: 0;
      overflow: hidden;
      opacity: 0;
    }

    &:hover {
      background-color: var(--color-active);
      opacity: 0.9;
    }
  }

  &:hover .logout-btn {
    justify-content: flex-start;
    padding-left: 25px;
    gap: 20px;
    .label {
      width: auto;
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 0;
    transform: translateX(-100%);
    &.active {
      width: 260px;
      transform: translateX(0);
    }
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 되었습니다.");
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <SidebarStyles $isDark={isDark}>
      <div className="top">
        <Link to="/" className="item-wrap logo">
          <img src={logoImg} alt="LOGO" />
          <span className="label">할래말래</span>
        </Link>
        <Link to="/" className="item-wrap">
          <img src={homeImg} alt="home" />
          <span className="label">대시보드</span>
        </Link>
        <Link to="/write" className="item-wrap">
          <img src={postImg} alt="post" />
          <span className="label">게시글쓰기</span>
        </Link>
        <Link to="/" className="item-wrap">
          <img src={dashboardImg} alt="group" />
          <span className="label">그룹</span>
        </Link>
        <Link to="/message" className="item-wrap">
          <img src={messageImg} alt="message" />
          <span className="label">메세지</span>
        </Link>
        <Link to="/user" className="item-wrap">
          <img src={profileImg} alt="mypage" />
          <span className="label">마이페이지</span>
        </Link>
      </div>

      <div className="bottom">
        <div className="item-wrap" onClick={toggleTheme}>
          <div className="switch-area">
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <img src={darkImg} alt="dark" />
              <span className="label">다크모드</span>
            </div>
            <div className="slider"></div>
          </div>
        </div>

        {token ? (
          <button onClick={handleLogout} className="item-wrap logout-btn">
            <img src={logoutImg} alt="dark" />
            <span className="label">로그아웃</span>
          </button>
        ) : (
          <Link to="/login" className="item-wrap logout-btn">
            <img src={loginImg} alt="dark" />
            <span className="label">로그인</span>
          </Link>
        )}
      </div>
    </SidebarStyles>
  );
};

export default Sidebar;
