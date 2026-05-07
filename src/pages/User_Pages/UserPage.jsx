import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";
import ProfileEditModal from "../../components/Modals/ProfileEditModal";
import AppointmentModal from "../../components/Modals/AppointmentModal";
import BlockedListModal from "../../components/Modals/BlockedListModal";
import ReportListModal from "../../components/Modals/ReportListModal";
import QAModal from "../../components/Modals/QAModal";
import styles from "./UserPage.module.css";

export default function UserPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'appointment' | 'blocked' | 'report'

  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("name") || "닉네임",
    email: localStorage.getItem("email") || "이메일 정보 없음",
    bio: localStorage.getItem("bio") || "소개 없음",
    profile_img: localStorage.getItem("profile_img") || "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
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
    <div className={styles.page}>
      {/* ── 프로필 영역 ── */}
      <div className={styles.profileWrap}>
        <div className={styles.profileImg}>
          {userInfo.profile_img && (
            <img src={getImageUrl(userInfo.profile_img)} alt="profile" />
          )}
        </div>

        <div className={styles.userInfo}>
          <h3>{userInfo.name} 님</h3>
          <p className={styles.email}>{userInfo.email}</p>
          <p className={styles.bio}>{userInfo.bio}</p>
          <div className={styles.userStats}>
            <p>약속 성공 0번</p>
            <p>실패 0번</p>
            <p>게시물 0개</p>
          </div>
        </div>

        <button className={styles.editBtn} onClick={() => setIsModalOpen(true)}>
          수정
        </button>
      </div>

      {/* ── 모달 ── */}
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
        <ReportListModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "qa" && <QAModal onClose={() => setActiveModal(null)} />}

      {/* ── 유틸 버튼 그리드 ── */}
      <div className={styles.profileUtil}>
        <button className={styles.util} onClick={() => navigate("/likes")}>
          찜 목록
        </button>
        <button className={styles.util} onClick={() => navigate("/my-posts")}>
          올린 게시글
        </button>
        <button
          className={styles.util}
          onClick={() => setActiveModal("appointment")}
        >
          내 약속 관리
        </button>
        <button
          className={styles.util}
          onClick={() => setActiveModal("blocked")}
        >
          차단 목록
        </button>
        <button
          className={styles.util}
          onClick={() => setActiveModal("report")}
        >
          신고 내역
        </button>
        <button className={styles.util} onClick={() => setActiveModal("qa")}>
          Q&A
        </button>
      </div>
    </div>
  );
}
