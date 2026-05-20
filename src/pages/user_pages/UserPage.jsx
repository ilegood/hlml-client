import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "../../api/instance";
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
      const { data } = await instance.get("/users/me/stats");
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
    loadStats();
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

        <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
          {"\uc218\uc815"}
        </button>
      </div>

      {/* ???? 癲ル슢?꾤땟??????? */}
      {isModalOpen && (
        <ProfileEditModal
          onClose={() => setIsModalOpen(false)}
          onSave={refreshUserInfo}
        />
      )}
      {activeModal === "appointment" && (
        <AppointmentModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "blocked" && (
        <BlockedListModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "report" && (
        <ReportListModal
          onClose={() => setActiveModal(null)}
          onChanged={loadStats}
        />
      )}
      {activeModal === "qa" && <QAModal onClose={() => setActiveModal(null)} />}

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
          Q&A
        </button>
      </div>
    </div>
  );
}
