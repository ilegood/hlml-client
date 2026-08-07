import ChatFileGallery from "./ChatFileGallery";
import UserProfileModal from "../modals/UserProfileModal";

const DMChatOverlays = ({
  currentUserId,
  messages,
  selectedProfileId,
  setSelectedProfileId,
  setShowFileGallery,
  showFileGallery,
}) => (
  <>
    {selectedProfileId && (
      <UserProfileModal
        userId={selectedProfileId}
        currentUserId={currentUserId}
        onClose={() => setSelectedProfileId(null)}
      />
    )}

    {showFileGallery && (
      <ChatFileGallery
        messages={messages}
        onClose={() => setShowFileGallery(false)}
      />
    )}
  </>
);

export default DMChatOverlays;
