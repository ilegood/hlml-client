import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/instance";

const getStoredUserInfo = () => ({
  name: localStorage.getItem("name") || "\ub2c9\ub124\uc784",
  email: localStorage.getItem("email") || "\uc774\uba54\uc77c \uc815\ubcf4 \uc5c6\uc74c",
  bio: localStorage.getItem("bio") || "\uc18c\uac1c \uc5c6\uc74c",
  profile_img: localStorage.getItem("profile_img") || "",
});

export const useUserPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    appointments: 0,
    reports: 0,
  });
  const [userInfo, setUserInfo] = useState(getStoredUserInfo);

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
    const timer = window.setTimeout(loadStats, 0);
    return () => window.clearTimeout(timer);
  }, [loadStats]);

  const refreshUserInfo = () => {
    setUserInfo(getStoredUserInfo());
  };

  return {
    activeModal,
    closeActiveModal: () => setActiveModal(null),
    closeProfileModal: () => setIsModalOpen(false),
    goToLikes: () => navigate("/likes"),
    goToMyPosts: () => navigate("/my-posts"),
    isModalOpen,
    loadStats,
    openAppointmentModal: () => setActiveModal("appointment"),
    openBlockedModal: () => setActiveModal("blocked"),
    openProfileModal: () => setIsModalOpen(true),
    openQAModal: () => setActiveModal("qa"),
    openReportModal: () => setActiveModal("report"),
    refreshUserInfo,
    stats,
    userInfo,
  };
};
