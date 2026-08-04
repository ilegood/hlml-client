import { getImageUrl } from "../../api/instance";
import UserPageModals from "../../components/modals/UserPageModals";
import { useUserPage } from "../../hooks/useUserPage";

const menuButtonClass =
  "h-[200px] w-[200px] cursor-pointer rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] text-[18px] font-medium text-[var(--color-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[6px] hover:border-[var(--color-active)] hover:bg-[var(--color-active)] hover:text-white";

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
      <div className="mb-[50px] flex w-full items-center justify-center border-b-2 border-[var(--color-border)] pb-[50px]">
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
          <h3 className="m-0">{userInfo.name} 님</h3>
          <p className="m-0 text-[13px] text-[var(--color-deactive)]">
            {userInfo.email}
          </p>
          <p className="mb-0 mt-[5px] text-[14px] text-[var(--color-text)] opacity-80">
            {userInfo.bio}
          </p>
          <div className="mt-[10px] flex gap-[16px]">
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              게시글 {stats.posts}개
            </p>
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              약속 {stats.appointments}회
            </p>
            <p className="m-0 text-[14px] text-[var(--color-text)]">
              신고 기록 {stats.reports}회
            </p>
          </div>
        </div>

        <button
          className="h-[35px] w-[100px] cursor-pointer rounded-[50px] border-0 bg-[var(--color-active)] font-semibold text-white transition-all duration-200 hover:scale-105 hover:opacity-80"
          onClick={openProfileModal}
        >
          수정
        </button>
      </div>

      <UserPageModals
        activeModal={activeModal}
        isProfileModalOpen={isModalOpen}
        onCloseActiveModal={closeActiveModal}
        onCloseProfileModal={closeProfileModal}
        onProfileSave={refreshUserInfo}
        onReportsChanged={loadStats}
      />

      <div className="grid grid-cols-[repeat(3,1fr)] gap-x-[100px] gap-y-[50px]">
        <button className={menuButtonClass} onClick={goToLikes}>
          찜 목록
        </button>
        <button className={menuButtonClass} onClick={goToMyPosts}>
          내 게시글
        </button>
        <button className={menuButtonClass} onClick={openAppointmentModal}>
          약속 관리
        </button>
        <button className={menuButtonClass} onClick={openBlockedModal}>
          차단 목록
        </button>
        <button className={menuButtonClass} onClick={openReportModal}>
          신고 내역
        </button>
        <button className={menuButtonClass} onClick={openQAModal}>
          Q&A
        </button>
      </div>
    </div>
  );
}
