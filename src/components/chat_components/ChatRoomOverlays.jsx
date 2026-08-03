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
  socketRef,
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
            // 서버에서 emitPostRoomUpdate로 room_info를 이미 브로드캐스트하므로
            // 별도 join_room 중복 emit 불필요
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
        onKick={(target) => {
          socketRef.current?.emit("kick_user", {
            roomId,
            targetUserId: target.user_id,
            targetNickname: target.nickname,
            myUserId: userId,
          });
          setRoomMembers((prev) =>
            prev.filter(
              (member) => Number(member.user_id) !== Number(target.user_id),
            ),
          );
        }}
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
