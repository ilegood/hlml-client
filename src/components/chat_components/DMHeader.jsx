import { getImageUrl } from "../../api/instance";

const DMHeader = ({
  targetUserId,
  targetProfileImg,
  targetNickname,
  targetOnline,
  setSelectedProfileId,
  notificationsMuted,
  toggleNotifications,
  setShowFileGallery,
  handleLeaveDM,
}) => (
      <div className={"[display:flex] [align-items:center] [gap:12px] [padding:30px_16px_0] [height:80px] [min-height:80px] [border-bottom:1px_solid_var(--color-border)] [background:var(--color-bg)] [box-shadow:0_1px_0_rgba(0,_0,_0,_0.1)] [z-index:100] [position:relative] [flex-shrink:0]"}>
        <button
          type="button"
          className={`${"[width:32px] [height:32px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [overflow:hidden] [flex-shrink:0]"} ${"[border:0] [padding:0] [background:transparent] [cursor:pointer]"}`}
          disabled={!targetUserId}
          onClick={() => setSelectedProfileId(targetUserId)}
          title="프로필 보기"
        >
          {targetProfileImg ? (
            <img
              src={getImageUrl(targetProfileImg)}
              alt="target"
              style={{ backgroundColor: "white" }}
            />
          ) : (
            <span className={"[color:var(--color-text)] [opacity:0.5] [font-size:18px] [font-weight:700]"}>👤</span>
          )}
        </button>
        <span
          className={"[font-size:15px] [font-weight:700] [color:var(--color-text)]"}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {targetNickname || "사용자"}
          {targetOnline && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#31c48d",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#31c48d",
                  display: "inline-block",
                }}
              />
              온라인
            </span>
          )}
        </span>
        <div className={"[width:1px] [height:24px] [background:var(--color-border)] [margin:0_4px]"} />
        <span className={"[font-size:13px] [color:#888] [flex:1] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]"}>
          {targetNickname}님과의 대화입니다.
        </span>
        <div className={"[display:flex] [align-items:center] [gap:4px] [margin-left:auto]"}>
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title={notificationsMuted ? "DM 알림 켜기" : "DM 알림 끄기"}
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
          <button
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:background_0.15s,_color_0.15s]"}
            title="나가기"
            onClick={handleLeaveDM}
          >
            🚪
          </button>
        </div>
      </div>


);

export default DMHeader;
