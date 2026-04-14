import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SidebarStyles = styled.div`
  width: 70px;
  padding: 30px 15px;
  background-color: var(--color-sidebar);
  box-shadow: 5px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    width 0.3s ease,
    padding 0.3s ease,
    background-color 0.3s ease;

  left: 0;
  position: fixed;
  top: 25px; /* Header 높이만큼 띄움 */
  height: calc(100vh - 25px);
  z-index: 1000;

  &:hover {
    width: 300px;
    padding: 30px;
  }

  img {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background-color: red;
  }

  .label {
    opacity: 0;
    white-space: nowrap;
    transition: opacity 0.15s ease 0s;
    color: var(--color-deactive);
  }

  &:hover .label {
    opacity: 1;
    transition: opacity 0.2s ease 0.2s;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    text-decoration: none;
    color: var(--color-active);
    font-size: 20px;
    font-weight: bold;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 14px;
    width: 100%;
    height: 48px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--color-deactive);
    font-size: 15px;
    transition: 0.2s ease;
  }

  .btn:hover {
    font-weight: bold;
    color: var(--color-active);
    background: color-mix(in srgb, var(--color-active) 15%, transparent);
  }

  .btn:hover .label {
    color: var(--color-active);
  }

  .bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text);
  }

  .switch input {
    display: none;
  }

  .slider {
    position: relative;
    width: 40px;
    height: 22px;
    background: var(--color-active);
    border-radius: 20px;
    cursor: pointer;
    margin-left: auto;
    flex-shrink: 0;
    transition: 0.3s ease;
  }

  .slider::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  input:checked + .slider {
    background: var(--color-deactive);
  }

  input:checked + .slider::before {
    transform: translateX(18px);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 44px;
    padding: 0 16px;
    border: none;
    background-color: var(--color-active);
    border-radius: 8px;
    color: white;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    width: 100%;
    transition: opacity 0.2s ease;
  }

  .logout-btn:hover {
    opacity: 0.85;
  }

  &:hover .logout-btn .label {
    opacity: 1;
    transition: opacity 0.2s ease 0.2s;
    color: white;
  }

  @media (max-width: 768px) {
    width: 0;
    padding: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease, width 0.3s ease;

    /* 필요한 경우 햄버거 메뉴 버튼을 통해 활성화된 상태(.active) 클래스 추가 가능 */
    &.active {
      width: 250px;
      padding: 20px;
      transform: translateX(0);
    }
  }

  @media (max-width: 480px) {
    /* 모바일에서는 하단 바로 전환하고 싶을 경우의 스타일 예시 */
    /* 여기서는 일단 숨김 처리만 유지합니다. */
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    toast.success("로그아웃 되었습니다.");
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <SidebarStyles>
      <div className="top">
        <Link to={"/"} className="logo">
          <img src="" alt="LOGO" />
          <span className="label">할래말래</span>
        </Link>
        <Link to={"/"} className="btn">
          <img src="" alt="dashboard" />
          <span className="label">대시보드</span>
        </Link>
        <Link to={"/"} className="btn">
          <img src="" alt="post" />
          <span className="label">게시글쓰기</span>
        </Link>
        <Link to={"/"} className="btn">
          <img src="" alt="group" />
          <span className="label">그룹</span>
        </Link>
        <Link to={"/"} className="btn">
          <img src="" alt="massage" />
          <span className="label">메세지</span>
        </Link>
        <Link to={"/user"} className="btn">
          <img src="" alt="mypage" />
          <span className="label">마이페이지</span>
        </Link>
      </div>

      <div className="bottom">
        <label className="switch">
          <img src="" alt="dark" />
          <span className="label">다크모드</span>
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">
            <img src="" alt="logout" />
            <span className="label">로그아웃</span>
          </button>
        ) : (
          <Link to="/login" className="logout-btn">
            <img src="" alt="logout" />
            <span className="label">로그인</span>
          </Link>
        )}
      </div>
    </SidebarStyles>
  );
};

export default Sidebar;
