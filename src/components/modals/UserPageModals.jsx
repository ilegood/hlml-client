import AppointmentModal from "./AppointmentModal";
import BlockedListModal from "./BlockedListModal";
import ProfileEditModal from "./ProfileEditModal";
import QAModal from "./QAModal";
import ReportListModal from "./ReportListModal";

const UserPageModals = ({
  activeModal,
  isProfileModalOpen,
  onCloseActiveModal,
  onCloseProfileModal,
  onProfileSave,
  onReportsChanged,
}) => (
  <>
    {isProfileModalOpen && (
      <ProfileEditModal onClose={onCloseProfileModal} onSave={onProfileSave} />
    )}
    {activeModal === "appointment" && (
      <AppointmentModal onClose={onCloseActiveModal} />
    )}
    {activeModal === "blocked" && (
      <BlockedListModal onClose={onCloseActiveModal} />
    )}
    {activeModal === "report" && (
      <ReportListModal
        onClose={onCloseActiveModal}
        onChanged={onReportsChanged}
      />
    )}
    {activeModal === "qa" && <QAModal onClose={onCloseActiveModal} />}
  </>
);

export default UserPageModals;
