import { getImageUrl } from "../../api/instance";
import {
  formatDMTime as formatTime,
  formatLastMessage,
  useDMList,
} from "../../hooks/useDMList";

const DMsPage = () => {
  const { dms, loading, onlineUsers, openDMRoom, unreadByRoomId } = useDMList();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-25px)] max-w-[900px] flex-col bg-[var(--color-bg)] p-5">
      <div className="mb-[25px] border-b border-[var(--color-border)] pb-[15px]">
        <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-active)]">
          개인 메시지
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-[5px] pb-[30px] pt-[5px]">
        {loading ? (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
            메시지를 불러오는 중...
          </div>
        ) : dms.length > 0 ? (
          dms.map((dm) => {
            const roomKey = String(dm.roomId);
            const unreadCount = unreadByRoomId.has(roomKey)
              ? unreadByRoomId.get(roomKey)
              : dm.unreadCount || 0;

            return (
              <div
                key={dm.roomId}
                className="flex min-h-[78px] cursor-pointer items-center gap-3.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-3.5 text-[var(--color-text)] transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-active)]"
                onClick={() => openDMRoom(dm.roomId)}
              >
                <div className="relative">
                  <div
                    className="h-[52px] w-[52px] overflow-hidden rounded-full bg-[var(--color-input-bg)] bg-cover bg-center"
                    style={{
                      backgroundImage: dm.targetProfileImg
                        ? `url(${getImageUrl(dm.targetProfileImg)})`
                        : "none",
                    }}
                  >
                    {!dm.targetProfileImg && <div className="h-full w-full" />}
                  </div>
                  {onlineUsers.has(Number(dm.targetId)) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--color-bg,#1a1a2e)] bg-[#31c48d]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-[5px] text-[15px] font-bold">
                    {dm.targetNickname}
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[var(--color-deactive)]">
                    {formatLastMessage(dm.lastMessage)}
                  </div>
                </div>

                <div className="flex min-w-[68px] flex-col items-end gap-2">
                  <div className="text-[12px] text-[var(--color-deactive)]">
                    {dm.lastMessageTime && formatTime(dm.lastMessageTime)}
                  </div>
                  {unreadCount > 0 && (
                    <span className="min-w-5 rounded-full bg-[var(--color-active)] px-1.5 py-0.5 text-center text-[11px] font-extrabold leading-4 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="mt-20 text-center text-[16px] font-semibold text-[var(--color-deactive)] opacity-70">
            진행 중인 대화가 없습니다.
            <br />
            친구 목록에서 메시지를 보내보세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default DMsPage;
