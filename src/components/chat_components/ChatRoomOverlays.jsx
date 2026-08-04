import ChatFileGallery from "./ChatFileGallery";
import ChatMembersModal from "../modals/ChatMembersModal";
import RoomSettingsModal from "../modals/RoomSettingsModal";
import UserProfileModal from "../modals/UserProfileModal";
import { normalizeRoomAppointment } from "../../utils/chatHelpers";

const ChatRoomOverlays = ({
  showSettings,
  setShowSettings,
  roomId,
  roomTitle,
  setRoomTitle,
  setRoomImage,
  setRoomLocation,
  setRoomAppointment,
  showFileGallery,
  setShowFileGallery,
  messages,
  showMembers,
  setShowMembers,
  roomMembers,
  roomAuthor,
  userId,
  onKickMember,
  selectedProfileId,
  setSelectedProfileId,
}) => (
  <>
      {showSettings && (
        <RoomSettingsModal
          roomId={roomId}
          onClose={() => setShowSettings(false)}
          onUpdate={(updatedPost) => {
            if (updatedPost) {
              setRoomTitle(updatedPost.title || roomTitle);
              setRoomImage(updatedPost.image || "");
              setRoomLocation({
                place: updatedPost.place || "",
                latitude: updatedPost.latitude
                  ? Number(updatedPost.latitude)
                  : null,
                longitude: updatedPost.longitude
                  ? Number(updatedPost.longitude)
                  : null,
              });
              setRoomAppointment(normalizeRoomAppointment(updatedPost));
            }
            // Room updates are broadcast by the server.
          }}
        />
      )}

      {showFileGallery && (
        <ChatFileGallery
          messages={messages}
          onClose={() => setShowFileGallery(false)}
        />
      )}

      <ChatMembersModal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        members={roomMembers}
        authorNickname={roomAuthor}
        currentUserId={userId}
        onKick={onKickMember}
      />

      {selectedProfileId && (
        <UserProfileModal
          userId={selectedProfileId}
          currentUserId={userId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}
  </>
);

export default ChatRoomOverlays;
