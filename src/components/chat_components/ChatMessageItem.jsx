import { useNavigate } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { getImageUrl } from "../../api/instance";
import { ChatMessageContent, MessageRowErrorBoundary } from "./ChatAttachment";
import { formatChatPreview } from "../../utils/chatPreview";
import {
  formatTime,
  formatDate,
  isSameDay,
  isCompact,
  displayName,
} from "../../utils/chatHelpers";
import borderImg from "../../assets/border.png";

function Avatar({ profileImg, nickname, isHost, size = 40, onClick }) {
  const url = getImageUrl(profileImg);
  const label = displayName(nickname);
  return (
    <div
      className={"[position:relative] [width:40px] [height:40px] [flex-shrink:0]"}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {isHost && (
        <img
          src={borderImg}
          className={"[position:absolute] [top:-25%] [left:-25%] [width:150%] [height:150%] [aspect-ratio:1/1] [object-fit:contain] [transform:scale(1.35)] [transform-origin:center] [z-index:5] [pointer-events:none]"}
          alt="host-border"
        />
      )}
      <div
        className={"[width:100%] [height:100%] [border-radius:50%] [background:gray] [display:flex] [align-items:center] [justify-content:center] [font-size:12px] [font-weight:700] [color:white] [flex-shrink:0] [overflow:hidden] [cursor:pointer]"}
        style={{ width: size, height: size, fontSize: size * 0.3 }}
      >
        {url ? (
          <img src={url} alt={label} style={{ backgroundColor: "white" }} />
        ) : (
          label.slice(0, 2)
        )}
      </div>
    </div>
  );
}

function ReplyPreview({ parentMsg, scrollToMessage }) {
  if (!parentMsg) return null;
  return (
    <div
      className={"[display:flex] [align-items:center] [gap:6px] [padding:2px_8px] [margin-bottom:4px] [font-size:13px] [cursor:pointer] [background:var(--color-input-bg)] [border-radius:4px] [width:fit-content] [max-width:90%] [border-left:3px_solid_var(--color-active)] [transition:background_0.15s]"}
      onClick={() => scrollToMessage(parentMsg.id)}
    >
      <div className={"[width:16px] [height:16px] [border-radius:50%] [background:var(--color-deactive)] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [overflow:hidden]"}>
        {parentMsg.profileImg ? (
          <img
            src={getImageUrl(parentMsg.profileImg)}
            alt={displayName(parentMsg.nickname)}
          />
        ) : (
          displayName(parentMsg.nickname).slice(0, 1)
        )}
      </div>
      <span className={"[font-weight:700] [color:var(--color-active)] [font-size:12px] [flex-shrink:0]"}>
        {displayName(parentMsg.nickname)}
      </span>
      <span className={"[color:var(--color-text)] [opacity:0.7] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis] [font-size:12px]"}>
        {parentMsg.isDeleted
          ? "삭제된 메시지"
          : formatChatPreview(parentMsg.content)}
      </span>
    </div>
  );
}

function ReactionBadges({ reactionMap, msgId, toggleReaction }) {
  if (Object.keys(reactionMap).length === 0) return null;
  return (
    <div className={"[display:flex] [flex-wrap:wrap] [gap:4px] [margin-top:4px]"}>
      {Object.entries(reactionMap).map(([emoji, { count, mine }]) => (
        <div
          key={emoji}
          className={`${"[background:var(--color-input-bg)] [border:1px_solid_var(--color-border)] [padding:2px_8px] [border-radius:8px] [font-size:13px] [cursor:pointer] [display:flex] [align-items:center] [gap:5px] [transition:all_0.1s] [height:24px]"} ${mine ? "[background:var(--color-input-focus-bg)] [border-color:var(--color-active)]" : ""}`}
          onClick={() => toggleReaction(msgId, emoji)}
        >
          {emoji}
          <span className={"[font-size:12px] [font-weight:600] [color:var(--color-text)]"}>{count}</span>
        </div>
      ))}
    </div>
  );
}

function ActionToolbar({
  msg,
  reactions,
  toggleReaction,
  showEmojiPicker,
  setShowEmojiPicker,
  startReply,
  startEdit,
  handleDelete,
  setShowCustomizer,
  isMine,
}) {
  return (
    <div className={"[position:absolute] [top:-16px] [right:8px] [display:flex] [align-items:center] [background:var(--color-bg)] [border:1px_solid_var(--color-border)] [border-radius:4px] [box-shadow:0_4px_8px_rgba(0,_0,_0,_0.2)] [z-index:200] [overflow:visible] [&>button]:[background:none] [&>button]:[border:none] [&>button]:[cursor:pointer] [&>button]:[padding:6px_8px] [&>button]:[font-size:16px] [&>button]:[display:flex] [&>button]:[align-items:center] [&>button]:[justify-content:center] [&>button]:[color:#888] [&>button]:[border-radius:3px] [&>button]:[position:relative] [&>button:hover]:[background:var(--color-input-bg)] [&>button:hover]:[color:var(--color-text)] [&>div>button]:[background:none] [&>div>button]:[border:none] [&>div>button]:[cursor:pointer] [&>div>button]:[padding:6px_8px] [&>div>button]:[font-size:16px] [&>div>button]:[display:flex] [&>div>button]:[align-items:center] [&>div>button]:[justify-content:center] [&>div>button]:[color:#888] [&>div>button]:[border-radius:3px] [&>div>button]:[position:relative] [&>div>button:hover]:[background:var(--color-input-bg)] [&>div>button:hover]:[color:var(--color-text)]"} onClick={(e) => e.stopPropagation()}>
      <div className={"[display:flex]"}>
        {reactions.map((emoji) => (
          <button
            key={emoji}
            type="button"
            title={emoji}
            onClick={() => toggleReaction(msg.id, emoji)}
          >
            {emoji}
          </button>
        ))}
        {setShowCustomizer && (
          <button
            type="button"
            className={""}
            title="반응 커스터마이즈"
            onClick={(e) => {
              e.stopPropagation();
              setShowCustomizer(true);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2" />
              <path d="M12 21v2" />
              <path d="M4.22 4.22l1.42 1.42" />
              <path d="M18.36 18.36l1.42-1.42" />
              <path d="M1 12h2" />
              <path d="M21 12h2" />
              <path d="M4.22 19.78l1.42-1.42" />
              <path d="M18.36 5.64l-1.42-1.42" />
            </svg>
          </button>
        )}
      </div>

      <div className={"[width:1px] [height:20px] [background:var(--color-border)] [margin:0_2px]"} />

      <button
        type="button"
        title="반응 추가"
        onClick={(e) => {
          e.stopPropagation();
          setShowEmojiPicker(msg.id);
        }}
        style={{ position: "relative" }}
      >
        반응
        {showEmojiPicker === msg.id && (
          <div
            className={"[position:absolute] [bottom:calc(100%_+_8px)] [right:0] [z-index:6000] [max-width:min(352px,_calc(100vw_-_28px))] [box-shadow:0_8px_24px_rgba(0,_0,_0,_0.3)] [border-radius:10px] [overflow:hidden] [animation:popIn_0.12s_ease-out] [transform-origin:bottom_right]"}
            onClick={(e) => e.stopPropagation()}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji) => toggleReaction(msg.id, emoji.native)}
              theme="dark"
              locale="ko"
            />
          </div>
        )}
      </button>

      <button type="button" title="답장" onClick={() => startReply(msg)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 17 4 12 9 7" />
          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
        </svg>
      </button>

      {isMine && (
        <>
          <button type="button" title="수정" onClick={() => startEdit(msg)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            title="삭제"
            onClick={() => handleDelete(msg.id)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default function ChatMessageItem({
  msg,
  idx,
  messages,
  userId,
  reactionMap: externalReactionMap,
  reactions,
  toggleReaction,
  showEmojiPicker,
  setShowEmojiPicker,
  startReply,
  startEdit,
  handleDelete,
  setShowCustomizer,
  scrollToMessage,
  setSelectedProfileId,
  hoveredMsgId,
  setHoveredMsgId,
  variant = "group",
  roomAuthor,
}) {
  const prevMsg = idx > 0 ? messages[idx - 1] : null;
  const showDateDivider = !isSameDay(prevMsg?.time, msg.time);
  const compact = !showDateDivider && isCompact(prevMsg, msg);
  const isMine = String(msg.userId) === String(userId);
  const parentMsg = msg.parentId
    ? messages.find((m) => m.id === msg.parentId)
    : null;

  const reactionMap =
    externalReactionMap ||
    (msg.reactions || []).reduce((acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
      acc[r.emoji].count++;
      if (String(r.userId || r.user_id) === String(userId))
        acc[r.emoji].mine = true;
      return acc;
    }, {});

  const navigate = useNavigate();

  if (msg.isSystem) {
    let systemText = msg.content;
    let parsed = null;
    try {
      parsed = JSON.parse(msg.content);
      if (parsed?.kind === "share_post") {
        const sharer = parsed.sharerNickname || "알 수 없음";
        const title = parsed.postTitle || "게시글";
        systemText = `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
      }
    } catch {
      /* not JSON */
    }

    return (
      <div key={msg.id || idx}>
        {showDateDivider && (
          <div className={"[display:flex] [align-items:center] [gap:8px] [padding:12px_8px] [margin:4px_0]"}>
            <span className={"[font-size:11px] [font-weight:600] [color:#888] [white-space:nowrap]"}>
              {formatDate(msg.time)}
            </span>
          </div>
        )}
        {parsed?.kind === "share_post" && (
          <div className={"[text-align:center] [font-size:13px] [font-weight:500] [color:#888] [padding:4px_8px] [align-self:center] [margin:4px_0]"}>{systemText}</div>
        )}
        {parsed?.kind === "share_post" && (
          <button
            type="button"
            onClick={() => navigate(`/detail/${parsed.postId}`)}
            className={"[flex-direction:column] [width:min(500px,_100%)] [min-height:auto] [overflow:hidden] [padding:0] [cursor:pointer] [text-align:left] [gap:0]"}
            disabled={!parsed.postId}
          >
            {parsed.postImage && (
              <div className={"[width:100%] [aspect-ratio:16_/_9] [overflow:hidden] [background-color:var(--color-border)] [display:flex] [justify-content:center] [align-items:center]"}>
                <img
                  src={getImageUrl(parsed.postImage)}
                  alt=""
                  className={"[width:100%] [height:100%] [display:block] [object-fit:cover]"}
                />
              </div>
            )}
            <div className={"[flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:4px] [padding:12px_14px_13px]"}>
              <span className={"[display:none]"}>공유된 게시글</span>
              <strong className={"[font-size:16px] [line-height:1.35] [color:var(--color-text)] [overflow:hidden] [text-overflow:ellipsis] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [white-space:normal]"}>
                {parsed.postTitle || "게시글"}
              </strong>
              <span className={"[font-size:12px] [line-height:1.35] [color:var(--color-deactive)] [overflow:hidden] [text-overflow:ellipsis] [white-space:normal]"}>
                {parsed.sharerNickname || "알 수 없음"}님이 공유했습니다.
              </span>
            </div>
          </button>
        )}
        {parsed?.kind !== "share_post" && (
          <div
            className={
              msg.isDeletionWarning ? "[text-align:center] [font-size:13px] [font-weight:700] [color:#666] [background:#f0f0f0] [padding:8px_16px] [border-radius:8px] [margin:12px_auto] [width:fit-content] [max-width:80%] [border:1px_solid_#ddd]" : "[text-align:center] [font-size:13px] [font-weight:500] [color:#888] [padding:4px_8px] [align-self:center] [margin:4px_0]"
            }
          >
            {systemText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div key={msg.id || idx}>
      {showDateDivider && (
        <div className={"[display:flex] [align-items:center] [gap:8px] [padding:12px_8px] [margin:4px_0]"}>
          <span className={"[font-size:11px] [font-weight:600] [color:#888] [white-space:nowrap]"}>{formatDate(msg.time)}</span>
        </div>
      )}

      <div
        id={`msg-${msg.id}`}
        className={`${"[display:flex] [flex-direction:row] [gap:0] [padding:2px_8px_2px_8px] [position:relative] [transition:background_0.05s]"} ${compact ? "[padding-top:1px] [padding-bottom:1px]" : "[margin-top:16px]"}`}
        onMouseEnter={() => setHoveredMsgId(msg.id)}
        onMouseLeave={() => setHoveredMsgId(null)}
      >
        <div className={"[width:40px] [flex-shrink:0] [display:flex] [justify-content:center] [padding-top:2px]"}>
          {compact ? (
            <span className={"[font-size:10px] [color:transparent] [width:40px] [text-align:center] [padding-top:3px] [line-height:1.2]"}>{formatTime(msg.time)}</span>
          ) : variant === "group" ? (
            <Avatar
              profileImg={msg.profileImg}
              nickname={displayName(msg.nickname)}
              isHost={displayName(msg.nickname) === roomAuthor}
              onClick={() => setSelectedProfileId(msg.userId)}
            />
          ) : (
            <Avatar
              profileImg={msg.profileImg}
              nickname={displayName(msg.nickname)}
              onClick={() => setSelectedProfileId(msg.userId)}
            />
          )}
        </div>

        <div className={"[flex:1] [min-width:0] [padding-left:12px]"}>
          {!compact && (
            <div className={"[display:flex] [align-items:baseline] [gap:8px] [margin-bottom:2px]"}>
              <span
                className={`${"[position:relative] [font-size:15px] [font-weight:600] [color:var(--color-text)] [cursor:pointer] [line-height:1.3]"} ${isMine ? "[color:var(--color-active)]" : ""}`}
                onClick={() => setSelectedProfileId(msg.userId)}
                style={{ cursor: "pointer" }}
              >
                {displayName(msg.nickname)}
              </span>
              <span className={"[font-size:11px] [color:#888] [font-weight:400]"}>
                {formatTime(msg.time)}
              </span>
            </div>
          )}

          <ReplyPreview
            parentMsg={parentMsg}
            scrollToMessage={scrollToMessage}
          />

          <div
            className={`${"[font-size:15px] [line-height:1.5] [word-break:break-word] [color:var(--color-text)] [white-space:pre-wrap]"} ${msg.isDeleted ? "[color:#888] [font-style:italic]" : ""} ${msg.isPending ? "[opacity:0.62]" : ""} ${msg.isFailed ? "[opacity:0.85] [color:#ef4444]" : ""}`}
          >
            <MessageRowErrorBoundary fallbackText={msg.content}>
              <ChatMessageContent content={msg.content} />
            </MessageRowErrorBoundary>
            {msg.isEdited && !msg.isDeleted && (
              <span className={"[font-size:10px] [color:#888] [font-style:italic] [margin-left:4px]"}>(수정됨)</span>
            )}
          </div>

          {isMine && msg.readCount > 0 && (
            <div className={"[font-size:10px] [color:var(--color-active)] [font-weight:700] [margin-top:2px]"}>{msg.readCount}명 읽음</div>
          )}

          <ReactionBadges
            reactionMap={reactionMap}
            msgId={msg.id}
            toggleReaction={toggleReaction}
          />
        </div>

        {hoveredMsgId === msg.id &&
          !msg.isDeleted &&
          !msg.isPending &&
          !msg.isFailed && (
            <ActionToolbar
              msg={msg}
              reactions={reactions}
              toggleReaction={toggleReaction}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              startReply={startReply}
              startEdit={startEdit}
              handleDelete={handleDelete}
              setShowCustomizer={setShowCustomizer}
              isMine={isMine}
            />
          )}
      </div>
    </div>
  );
}

export { Avatar };
