import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext.jsx";
import { useChatNotifications } from "../../context/ChatNotificationContext";
import styles from "./Sidebar.module.css";

import logoImg from "../../assets/logo.png";
import dashboardImg from "../../assets/dashboard.png";
import homeImg from "../../assets/home.png";
import postImg from "../../assets/post.png";
import messageImg from "../../assets/message.png";
import profileImg from "../../assets/profile.png";
import darkImg from "../../assets/dark.png";
import logoutImg from "../../assets/logout.png";
import loginImg from "../../assets/login.png";

const Badge = ({ count }) => {
  if (!count) return null;
  return <span className={styles.badge}>{count > 99 ? "99+" : count}</span>;
};

const isGroupMuted = (roomId) =>
  localStorage.getItem(`chat-muted:${roomId}`) === "1";

const isDmMuted = (roomId) =>
  localStorage.getItem(`dm-muted:${roomId}`) === "1";

const isNotificationMuted = (item) => {
  if (item.type === "dm") return isDmMuted(item.roomId);
  if (item.type === "group") return isGroupMuted(item.roomId);
  return false;
};

const countVisibleUnread = (rooms = [], isMuted) =>
  rooms.reduce(
    (sum, room) =>
      isMuted(room.roomId) ? sum : sum + Number(room.unreadCount || 0),
    0,
  );

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const { summary, notifications, refresh } = useChatNotifications() || {};
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const hoverCloseTimer = useRef(null);
  const notificationRef = useRef(null);

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

  const handleSidebarEnter = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    setIsHovered(true);
  };

  const handleSidebarLeave = () => {
    if (hoverCloseTimer.current) {
      window.clearTimeout(hoverCloseTimer.current);
    }
    hoverCloseTimer.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current) {
        window.clearTimeout(hoverCloseTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showNotifications) return;

    const handlePointerDown = (event) => {
      if (notificationRef.current?.contains(event.target)) return;
      setShowNotifications(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showNotifications]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const openNotificationTarget = (item) => {
    setShowNotifications(false);
    if (item.type === "dm") {
      navigate(`/dms/${item.roomId}`);
      return;
    }
    navigate(`/chat-rooms/${item.roomId}`);
  };

  const reminderItems = notifications?.reminders || [];
  const unreadItems = (notifications?.unread || []).filter(
    (item) => !isNotificationMuted(item),
  );
  const visibleGroupUnread = countVisibleUnread(
    summary?.rooms?.groups || [],
    isGroupMuted,
  );
  const visibleDmUnread = countVisibleUnread(summary?.rooms?.dms || [], isDmMuted);
  const visibleTotalUnread = visibleGroupUnread + visibleDmUnread;

  return (
    <div className={`${styles.sidebar} ${isHovered ? styles.open : ""}`} onMouseEnter={handleSidebarEnter} onMouseLeave={handleSidebarLeave}>
      <div className={styles.top}>
        <Link to="/" className={`${styles.itemWrap} ${styles.logo}`}>
          <img src={logoImg} alt="LOGO" />
          <span className={styles.label}>할래말래</span>
        </Link>
        <Link to="/" className={styles.itemWrap}>
          <img src={homeImg} alt="home" />
          <span className={styles.label}>대시보드</span>
        </Link>
        <Link to="/write" className={styles.itemWrap}>
          <img src={postImg} alt="post" />
          <span className={styles.label}>게시글 쓰기</span>
        </Link>
        <Link to="/chat-rooms" className={styles.itemWrap}>
          <img src={dashboardImg} alt="group" />
          <span className={styles.label}>그룹</span>
          <Badge count={visibleGroupUnread} />
        </Link>
        <Link to="/dms" className={styles.itemWrap}>
          <img src={messageImg} alt="message" />
          <span className={styles.label}>메시지</span>
          <Badge count={visibleDmUnread} />
        </Link>
        <Link to="/user" className={styles.itemWrap}>
          <img src={profileImg} alt="mypage" />
          <span className={styles.label}>마이페이지</span>
        </Link>

        {token && (
          <div className={styles.notificationWrap} ref={notificationRef}>
            <button
              type="button"
              className={styles.itemWrap}
              onClick={() => {
                setShowNotifications((prev) => !prev);
                refresh?.();
              }}
            >
              <img src={messageImg} alt="notifications" />
              <span className={styles.label}>알림</span>
              <Badge count={visibleTotalUnread + reminderItems.length} />
            </button>

            {showNotifications && (
              <div className={styles.notificationPanel}>
                <div className={styles.notificationTitle}>알림 센터</div>
                {reminderItems.length === 0 && unreadItems.length === 0 ? (
                  <div className={styles.notificationEmpty}>새 알림이 없습니다.</div>
                ) : (
                  <>
                    {reminderItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={styles.notificationItem}
                        onClick={() => openNotificationTarget(item)}
                      >
                        <span className={styles.notificationMain}>
                          {item.title}
                        </span>
                        <span className={styles.notificationSub}>
                          약속이 30분 이내에 시작됩니다.
                        </span>
                      </button>
                    ))}
                    {unreadItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={styles.notificationItem}
                        onClick={() => openNotificationTarget(item)}
                      >
                        <span className={styles.notificationMain}>
                          {item.title}
                        </span>
                        <span className={styles.notificationSub}>
                          읽지 않은 메시지 {item.count}개
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <div className={styles.itemWrap} onClick={toggleTheme}>
          <div className={styles.switchArea}>
            <div className={styles.switchLeft}>
              <img src={darkImg} alt="dark" />
              <span className={styles.label}>다크모드</span>
            </div>
            <div
              className={styles.slider}
              style={{
                "--slider-translate": isDark
                  ? "translateX(18px)"
                  : "translateX(0)",
              }}
            />
          </div>
        </div>

        {token ? (
          <button
            type="button"
            onClick={handleLogout}
            className={`${styles.itemWrap} ${styles.logoutBtn}`}
          >
            <img src={logoutImg} alt="logout" />
            <span className={styles.label}>로그아웃</span>
          </button>
        ) : (
          <Link
            to="/login"
            className={`${styles.itemWrap} ${styles.logoutBtn}`}
          >
            <img src={loginImg} alt="login" />
            <span className={styles.label}>로그인</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
