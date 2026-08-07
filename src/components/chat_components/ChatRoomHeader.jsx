import { getImageUrl } from "../../api/instance";

const ChatRoomHeader = ({
  roomImage,
  postData,
  roomTitle,
  roomId,
  roomAuthor,
  name,
  roomLocation,
  setShowSettings,
  notificationsMuted,
  toggleNotifications,
  setShowFileGallery,
  openRoomMap,
  toggleMembers,
  handleLeave,
}) => (
      <div className={"[display:flex] [align-items:center] [gap:12px] [padding:30px_16px_0] [height:80px] [min-height:80px] [border-bottom:1px_solid_var(--color-border)] [background:var(--color-bg)] [box-shadow:0_1px_0_rgba(0,_0,_0,_0.1)] [z-index:100] [position:relative] [flex-shrink:0]"}>
        <div className={"[width:32px] [height:32px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [overflow:hidden] [flex-shrink:0]"}>
          {roomImage ? (
            <img src={getImageUrl(roomImage)} alt="room" />
          ) : (
            <span className={"[color:var(--color-text)] [opacity:0.5] [font-size:18px] [font-weight:700]"} style={{ fontSize: 22 }}>
              {postData &&
                (() => {
                  const CAT_MAP = {
                    게임: "🎮",
                    스터디: "📚",
                    운동: "🏃",
                    맛집: "🍽️",
                    여행: "✈️",
                    음악: "🎵",
                    영화: "🎬",
                    사진: "📷",
                    반려동물: "🐾",
                    독서: "📖",
                    언어: "💬",
                    취미: "🎨",
                    패션: "👗",
                    기타: "💡",
                  };
                  const cats = postData.categories || {};
                  const key = Object.keys(cats).find((k) => cats[k]);
                  return key && CAT_MAP[key] ? CAT_MAP[key] : "#";
                })()}
            </span>
          )}
        </div>
        <span className={"[font-size:15px] [font-weight:700] [color:var(--color-text)]"}>
          {roomTitle || `채팅방 ${roomId}`}
        </span>
        <div className={"[width:1px] [height:24px] [background:var(--color-border)] [margin:0_4px]"} />
        <span className={"[font-size:13px] [color:#888] [flex:1] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]"}>
          {roomTitle ? `${roomTitle} 채팅방입니다.` : ""}
        </span>
        <div className={"[display:flex] [align-items:center] [gap:4px] [margin-left:auto]"}>
          {name === roomAuthor && (
            <button
              className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
              title="방 설정 변경"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          )}
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title={notificationsMuted ? "채팅 알림 켜기" : "채팅 알림 끄기"}
            onClick={toggleNotifications}
          >
            {notificationsMuted ? "🔕" : "🔔"}
          </button>
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title="파일 모아보기"
            onClick={() => setShowFileGallery(true)}
          >
            📎
          </button>
          {roomLocation?.latitude && (
            <button
              className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
              title="지도보기"
              onClick={openRoomMap}
            >
              🗺️
            </button>
          )}
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title="멤버보기"
            onClick={toggleMembers}
          >
            👥
          </button>
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title="나가기"
            onClick={handleLeave}
          >
            🚪
          </button>
        </div>
      </div>


);

export default ChatRoomHeader;
