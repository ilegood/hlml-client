<<<<<<< Updated upstream
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";
import { getMyStats } from "../../api/users";
import ProfileEditModal from "../../components/modals/ProfileEditModal";
import AppointmentModal from "../../components/modals/AppointmentModal";
import BlockedListModal from "../../components/modals/BlockedListModal";
import ReportListModal from "../../components/modals/ReportListModal";
import QAModal from "../../components/modals/QAModal";
import styles from "./UserPage.module.css";

export default function UserPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'appointment' | 'blocked' | 'report'
  const [stats, setStats] = useState({
    posts: 0,
    appointments: 0,
    reports: 0,
  });

  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("name") || "\ub2c9\ub124\uc784",
    email: localStorage.getItem("email") || "\uc774\uba54\uc77c \uc815\ubcf4 \uc5c6\uc74c",
    bio: localStorage.getItem("bio") || "\uc18c\uac1c \uc5c6\uc74c",
    profile_img: localStorage.getItem("profile_img") || "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const loadStats = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    const nickname = localStorage.getItem("name");
    if (!userId && !nickname) return;

    try {
      const data = await getMyStats();
      setStats({
        posts: Number(data.posts) || 0,
        appointments: Number(data.appointments) || 0,
        reports: Number(data.reports) || 0,
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadStats, 0);
    return () => window.clearTimeout(timer);
  }, [loadStats]);

  const refreshUserInfo = () => {
    setUserInfo({
      name: localStorage.getItem("name") || "\ub2c9\ub124\uc784",
      email: localStorage.getItem("email") || "\uc774\uba54\uc77c \uc815\ubcf4 \uc5c6\uc74c",
      bio: localStorage.getItem("bio") || "\uc18c\uac1c \uc5c6\uc74c",
      profile_img: localStorage.getItem("profile_img") || "",
    });
  };

  return (
    <div className={styles.page}>
      {/* ???? ??ш끽維곩ㅇ?????ㅼ굡?????? */}
      <div className={styles.profileWrap}>
        <div className={styles.profileImg}>
=======
import { getImageUrl } from "../../api/instance";
import UserPageModals from "../../components/modals/UserPageModals";
import { useUserPage } from "../../hooks/useUserPage";

export default function UserPage() {
  const {
    activeModal,
    closeActiveModal,
    closeProfileModal,
    goToLikes,
    goToMyPosts,
    isModalOpen,
    loadStats,
    openAppointmentModal,
    openBlockedModal,
    openProfileModal,
    openQAModal,
    openReportModal,
    refreshUserInfo,
    stats,
    userInfo,
  } = useUserPage();

  return (
    <div className="flex h-[calc(100vh-25px)] flex-col items-center justify-center">
      {/* 프로필 정보 영역 */}
      <div className="flex w-full items-center justify-center border-b-2 border-[var(--color-border)] pb-[50px] mb-[50px]">
        <div className="mr-[25px] h-[100px] w-[100px] overflow-hidden rounded-full border border-[var(--color-border)] bg-white">
>>>>>>> Stashed changes
          {userInfo.profile_img && (
            <img src={getImageUrl(userInfo.profile_img)} alt="profile" />
          )}
        </div>

        <div className={styles.userInfo}>
          <h3>
            {userInfo.name} {"\ub2d8"}
          </h3>
          <p className={styles.email}>{userInfo.email}</p>
          <p className={styles.bio}>{userInfo.bio}</p>
          <div className={styles.userStats}>
            <p>
              {"\uac8c\uc2dc\uae00"} {stats.posts}
              {"\uac1c"}
            </p>
            <p>
              {"\uc57d\uc18d"} {stats.appointments}
              {"\ud68c"}
            </p>
            <p>
              {"\uc2e0\uace0 \uae30\ub85d"} {stats.reports}
              {"\ud68c"}
            </p>
          </div>
        </div>

<<<<<<< Updated upstream
        <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
=======
        <button
          className="h-[35px] w-[100px] cursor-pointer rounded-[50px] border-0 bg-[var(--color-active)] font-semibold text-white transition-all duration-200 hover:scale-105 hover:opacity-80"
          onClick={openProfileModal}
        >
>>>>>>> Stashed changes
          {"\uc218\uc815"}
        </button>
      </div>

      {/* 마이페이지 모달 */}
      <UserPageModals
        activeModal={activeModal}
        isProfileModalOpen={isModalOpen}
        onCloseActiveModal={closeActiveModal}
        onCloseProfileModal={closeProfileModal}
        onProfileSave={refreshUserInfo}
        onReportsChanged={loadStats}
      />

<<<<<<< Updated upstream
      {/* ???? ???ャ뀖???類??????숆강筌??????? */}
      <div className={styles.profileUtil}>
        <button className={styles.util} onClick={() => navigate("/likes")}>
          {"\ucc1c \ubaa9\ub85d"}
        </button>
        <button className={styles.util} onClick={() => navigate("/my-posts")}>
          {"\ub0b4 \uac8c\uc2dc\uae00"}
        </button>
        <button className={styles.util} onClick={() => setActiveModal("appointment")}>
          {"\uc57d\uc18d \uad00\ub9ac"}
        </button>
        <button className={styles.util} onClick={() => setActiveModal("blocked")}>
          {"\ucc28\ub2e8 \ubaa9\ub85d"}
        </button>
        <button className={styles.util} onClick={() => setActiveModal("report")}>
          {"\uc2e0\uace0 \ub0b4\uc5ed"}
        </button>
        <button className={styles.util} onClick={() => setActiveModal("qa")}>
=======
      {/* 마이페이지 메뉴 */}
      <div className="grid grid-cols-[repeat(3,1fr)] gap-x-[100px] gap-y-[50px]">
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={goToLikes}>
          {"\ucc1c \ubaa9\ub85d"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={goToMyPosts}>
          {"\ub0b4 \uac8c\uc2dc\uae00"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={openAppointmentModal}>
          {"\uc57d\uc18d \uad00\ub9ac"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={openBlockedModal}>
          {"\ucc28\ub2e8 \ubaa9\ub85d"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={openReportModal}>
          {"\uc2e0\uace0 \ub0b4\uc5ed"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={openQAModal}>
>>>>>>> Stashed changes
          Q&A
        </button>
      </div>
    </div>
  );
}
