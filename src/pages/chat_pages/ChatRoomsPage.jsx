import ChatRoomItem from "../../components/chat_components/ChatRoomItem";
import { useChatRooms } from "../../hooks/useChatRooms";

const ChatRoomsPage = () => {
  const {
    chatRooms,
    handleDeleteKickedRoom,
    loading,
    unreadByRoomId,
    userId,
  } = useChatRooms();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-25px)] max-w-[900px] flex-col bg-[var(--color-bg)] p-5">
      <div className="mb-[25px] border-b border-[var(--color-border)] pb-[15px]">
        <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-active)]">
          채팅방 목록
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-[5px] pb-[30px] pt-[5px]">
        {loading ? (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
            채팅방을 불러오는 중...
          </div>
        ) : chatRooms.length > 0 ? (
          chatRooms.map((room) => {
            const roomId = String(room.post_id || room.id);
            return (
              <ChatRoomItem
                key={room.id}
                room={{
                  ...room,
                  unreadCount: unreadByRoomId.get(roomId) || 0,
                }}
                onDelete={
                  room.isKicked ? () => handleDeleteKickedRoom(room.id) : null
                }
              />
            );
          })
        ) : (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
            {userId
              ? "참여 중인 채팅방이 없습니다."
              : "로그인하면 채팅방 목록을 확인할 수 있습니다."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
