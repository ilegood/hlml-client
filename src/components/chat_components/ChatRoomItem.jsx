import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChatRoomItem = ({ room, onDelete, hideUnreadBadge = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    if (date.getFullYear() !== now.getFullYear()) {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return String(timeStr).slice(0, 5);
  };

  const handleClick = () => {
    if (room.isKicked) {
      toast.error("강퇴된 채팅방에는 입장할 수 없습니다.");
      return;
    }
    navigate(`/chat-rooms/${room.post_id || room.id}`);
  };

  return (
    <div
      className={`${"[display:flex] [align-items:center] [gap:20px] [padding:24px] [min-height:110px] [background-color:var(--color-sidebar)] [border-radius:20px] [box-shadow:0_4px_15px_rgba(0,_0,_0,_0.05)] [color:var(--color-text)] [transition:all_0.3s_ease] [border:2px_solid_var(--color-border)] [cursor:pointer] hover:[transform:translateY(-4px)] hover:[box-shadow:0_8px_25px_rgba(253,_147,_25,_0.1)] hover:[border-color:var(--color-active)]"} ${room.isKicked ? "[opacity:0.6] [background-color:var(--color-input-bg)] [cursor:default] [position:relative]" : ""}`}
      onClick={handleClick}
      style={{ cursor: room.isKicked ? "default" : "pointer" }}
    >
      <div
        className={"[width:70px] [height:70px] [border-radius:18px] [flex-shrink:0] [background-size:cover] [background-position:center] [overflow:hidden] [border:1px_solid_var(--color-border)]"}
        style={{ backgroundImage: room.image ? `url(${room.image})` : "none" }}
      >
        {!room.image && <div className={"[width:100%] [height:100%] [background:linear-gradient(135deg,_var(--color-active)_0%,_#ffb35c_100%)] [opacity:0.2]"} />}
      </div>

      <div className={"[flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:4px]"}>
        <div className={"[font-weight:800] [font-size:17px] [color:var(--color-text)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]"}>
          {room.title || "제목 없음"}
          {room.isKicked && <span className={"[display:inline-block] [margin-left:8px] [background-color:#ff4757] [color:white] [font-size:11px] [padding:2px_6px] [border-radius:4px] [font-weight:600] [vertical-align:middle]"}>강퇴됨</span>}
        </div>
        <div className={"[font-size:14px] [color:var(--color-deactive)] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis] [opacity:0.8]"}>
          방장: {room.authorNickname || room.author || "이름 없음"}
        </div>
      </div>

      <div className={"[display:flex] [flex-direction:column] [align-items:flex-end] [gap:4px] [min-width:120px] [flex-shrink:0]"}>
        <div className={"[font-size:14px] [font-weight:700] [color:var(--color-active)]"}>
          {room.date && formatDate(room.date)}
          {room.date && room.time && " / "}
          {room.time && formatTime(room.time)}
        </div>
        <div className={"[font-size:12px] [color:var(--color-deactive)] [font-weight:500] [max-width:150px] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]"}>{room.place || ""}</div>
        {!hideUnreadBadge && room.unreadCount > 0 && (
          <span className={"[min-width:22px] [height:22px] [padding:0_7px] [border-radius:999px] [background:#ff4757] [color:white] [font-size:12px] [font-weight:800] [line-height:22px] [text-align:center] [align-self:flex-end]"}>
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        )}
      </div>

      {onDelete && (
        <button
          className={"[background:var(--color-border)] [border:none] [color:var(--color-text)] [font-size:20px] [width:28px] [height:28px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [opacity:0] [margin-left:10px] hover:[background-color:#ff4757] hover:[color:white]"}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="목록에서 삭제"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ChatRoomItem;
