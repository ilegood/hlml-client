
const ChatRoomAccessState = ({
  loadingPost,
  postData,
  isParticipant,
  joining,
  isFull,
  onJoin,
  onBack,
}) => {
  if (loadingPost) {
    return (
      <div className={"[display:flex] [flex-direction:column] [height:calc(100vh_-_25px)] [background:var(--color-bg)] [padding:0_200px] [font-family:inherit] [overflow-x:hidden]"}>
        <div className={"[position:fixed] [inset:0] [z-index:10000] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.45)] [backdrop-filter:blur(5px)]"}>
          <div className={"[width:min(420px,_calc(100vw_-_32px))] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-bg)] [color:var(--color-text)] [padding:20px] [box-shadow:0_16px_40px_rgba(0,_0,_0,_0.35)]"}>
            <p style={{ textAlign: "center" }}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className={"[display:flex] [flex-direction:column] [height:calc(100vh_-_25px)] [background:var(--color-bg)] [padding:0_200px] [font-family:inherit] [overflow-x:hidden]"}>
        <div className={"[position:fixed] [inset:0] [z-index:10000] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.45)] [backdrop-filter:blur(5px)]"}>
          <div className={"[width:min(420px,_calc(100vw_-_32px))] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-bg)] [color:var(--color-text)] [padding:20px] [box-shadow:0_16px_40px_rgba(0,_0,_0,_0.35)]"}>
            <h3>게시글을 찾을 수 없습니다.</h3>
            <p>존재하지 않거나 삭제된 게시글입니다.</p>
            <button type="button" onClick={onBack}>
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className={"[display:flex] [flex-direction:column] [height:calc(100vh_-_25px)] [background:var(--color-bg)] [padding:0_200px] [font-family:inherit] [overflow-x:hidden]"}>
        <div className={"[position:fixed] [inset:0] [z-index:10000] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.45)] [backdrop-filter:blur(5px)]"}>
          <div className={"[width:min(420px,_calc(100vw_-_32px))] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-bg)] [color:var(--color-text)] [padding:20px] [box-shadow:0_16px_40px_rgba(0,_0,_0,_0.35)]"}>
            <h2 style={{ marginTop: 0 }}>{postData.title}</h2>
            {(postData.date || postData.time) && (
              <p style={{ margin: "4px 0", color: "#888" }}>
                {postData.date || ""} {postData.time?.slice(0, 5) || ""}
              </p>
            )}
            {postData.place && (
              <p style={{ margin: "4px 0", color: "#888" }}>
                {postData.place}
              </p>
            )}
            <p style={{ margin: "4px 0", color: "#888" }}>
              멤버 {postData.participants || 1}/{postData.capacity || "-"}
            </p>
            {postData.content && (
              <p
                style={{
                  margin: "12px 0",
                  padding: "10px",
                  background: "var(--color-input-bg)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  maxHeight: "80px",
                  overflow: "hidden",
                }}
              >
                {postData.content}
              </p>
            )}
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--color-border)",
                margin: "16px 0",
              }}
            />
            <h3 style={{ margin: "0 0 16px" }}>참여하시겠습니까?</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onJoin}
                disabled={joining || isFull}
                style={{
                  flex: 1,
                  height: 40,
                  border: "none",
                  borderRadius: 6,
                  background: isFull ? "#888" : "var(--color-active)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: isFull ? "default" : "pointer",
                }}
              >
                {joining
                  ? "참여 중..."
                  : isFull
                    ? "정원이 가득 찼습니다"
                    : "참여하기"}
              </button>
              <button
                type="button"
                onClick={onBack}
                style={{
                  flex: 1,
                  height: 40,
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--color-text)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatRoomAccessState;
