import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/auth";
import FriendsList from "./FriendsList";
import styles from "./Sidebar.module.css";

// ── 이미지 임포트 ──────────────────────────────────────────
import logoImg    from "../assets/logo.png";
import dashboardImg from "../assets/dashboard.png";
import homeImg    from "../assets/home.png";
import postImg    from "../assets/post.png";
import messageImg from "../assets/message.png";
import profileImg from "../assets/profile.png";
import darkImg    from "../assets/dark.png";
import logoutImg  from "../assets/logout.png";
import loginImg   from "../assets/login.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
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

  const handleProtectedNav = (path) => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div className={styles.sidebar}>
      {/* ── Top ── */}
      <div className={styles.top}>
        <Link to="/" className={`${styles.itemWrap} ${styles.logo}`}>
          <img src={logoImg} alt="LOGO" />
          <span className={styles.label}>할래말래</span>
        </Link>

        <Link to="/" className={styles.itemWrap}>
          <img src={homeImg} alt="home" />
          <span className={styles.label}>대시보드</span>
        </Link>

        <div className={styles.itemWrap} onClick={() => handleProtectedNav("/write")}>
          <img src={postImg} alt="post" />
          <span className={styles.label}>게시글쓰기</span>
        </div>

        <div className={styles.itemWrap} onClick={() => handleProtectedNav("/")}>
          <img src={dashboardImg} alt="group" />
          <span className={styles.label}>그룹</span>
        </div>

        <div className={styles.itemWrap} onClick={() => handleProtectedNav("/")}>
          <img src={messageImg} alt="message" />
          <span className={styles.label}>메세지</span>
        </div>

        <div className={styles.itemWrap} onClick={() => handleProtectedNav("/user")}>
          <img src={profileImg} alt="mypage" />
          <span className={styles.label}>마이페이지</span>
        </div>
      </div>

      {/* ── Bottom ── */}
      <div className={styles.bottom}>
        {/* 다크모드 토글 */}
        <div className={styles.itemWrap} onClick={() => setIsDark((p) => !p)}>
          <div className={styles.switchArea}>
            <div className={styles.switchLeft}>
              <img src={darkImg} alt="dark" />
              <span className={styles.label}>다크모드</span>
            </div>
            {/* isDark에 따른 circle 위치를 인라인 style로 처리 */}
            <div
              className={styles.slider}
              style={{ "--slider-translate": isDark ? "translateX(18px)" : "translateX(0)" }}
            />
          </div>
        </div>

        {/* 로그아웃 / 로그인 */}
        {token ? (
          <button
            onClick={handleLogout}
            className={`${styles.itemWrap} ${styles.logoutBtn}`}
          >
            <img src={logoutImg} alt="logout" />
            <span className={styles.label}>로그아웃</span>
          </button>
        ) : (
          <Link to="/login" className={`${styles.itemWrap} ${styles.logoutBtn}`}>
            <img src={loginImg} alt="login" />
            <span className={styles.label}>로그인</span>
          </Link>
        )}
      </div>

      <FriendsList />
    </div>
  );
};

export default Sidebar;
