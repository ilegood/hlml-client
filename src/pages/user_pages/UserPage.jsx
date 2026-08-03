import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "../../api/instance";
import ProfileEditModal from "../../components/modals/ProfileEditModal";
import AppointmentModal from "../../hooks/friend/AppointmentModal";
import BlockedListModal from "../../hooks/friend/BlockedListModal";
import ReportListModal from "../../components/modals/ReportListModal";
import QAModal from "../../components/modals/QAModal";

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
    <div className="flex h-[calc(100vh-25px)] flex-col items-center justify-center">
      {/* ???? ??ш끽維곩ㅇ?????ㅼ굡?????? */}
      <div className="flex w-full items-center justify-center border-b-2 border-[var(--color-border)] pb-[50px] mb-[50px]">
        <div className="mr-[25px] h-[100px] w-[100px] overflow-hidden rounded-full border border-[var(--color-border)] bg-white">
          {userInfo.profile_img && (
            <img
              className="h-full w-full object-cover"
              src={getImageUrl(userInfo.profile_img)}
              alt="profile"
            />
          )}
        </div>

        <div className="mr-[200px] flex flex-col gap-[2px] text-[var(--color-text)]">
          <h3 className="m-0">
            {userInfo.name} {"\ub2d8"}
          </h3>
          <p className="m-0 text-[13px] text-[var(--color-deactive)]">{userInfo.email}</p>
          <p className="mt-[5px] mb-0 text-[14px] text-[var(--color-text)] opacity-80">{userInfo.bio}</p>
          <div className="mt-[10px] flex gap-[16px]">
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              {"\uac8c\uc2dc\uae00"} {stats.posts}
              {"\uac1c"}
            </p>
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              {"\uc57d\uc18d"} {stats.appointments}
              {"\ud68c"}
            </p>
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              {"\uc2e0\uace0 \uae30\ub85d"} {stats.reports}
              {"\ud68c"}
            </p>
          </div>
        </div>

        <button
          className="h-[35px] w-[100px] cursor-pointer rounded-[50px] border-0 bg-[var(--color-active)] font-semibold text-white transition-all duration-200 hover:scale-105 hover:opacity-80"
          onClick={() => setIsModalOpen(true)}
        >
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
      <div className="grid grid-cols-[repeat(3,1fr)] gap-x-[100px] gap-y-[50px]">
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => navigate("/likes")}>
          {"\ucc1c \ubaa9\ub85d"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => navigate("/my-posts")}>
          {"\ub0b4 \uac8c\uc2dc\uae00"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => setActiveModal("appointment")}>
          {"\uc57d\uc18d \uad00\ub9ac"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => setActiveModal("blocked")}>
          {"\ucc28\ub2e8 \ubaa9\ub85d"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => setActiveModal("report")}>
          {"\uc2e0\uace0 \ub0b4\uc5ed"}
        </button>
        <button className="h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white" onClick={() => setActiveModal("qa")}>
          Q&A
        </button>
      </div>
    </div>
  );
}
