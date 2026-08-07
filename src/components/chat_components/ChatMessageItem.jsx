import { getImageUrl } from "../../api/instance";
import { ChatMessageContent, MessageRowErrorBoundary } from "./ChatMessageContent";
import ChatMessageAvatar from "./ChatMessageAvatar";
import MessageActionToolbar from "./MessageActionToolbar";
import SystemChatMessage from "./SystemChatMessage";
import { formatChatPreview } from "../../utils/chatPreview";
import { formatTime, formatDate, isSameDay, isCompact, displayName } from "../../utils/chatHelpers";

function ReplyPreview({ parentMsg, scrollToMessage }) {
  if (!parentMsg) return null;
  return (
    <div className="[display:flex] [align-items:center] [gap:6px] [padding:2px_8px] [margin-bottom:4px] [font-size:13px] [cursor:pointer] [background:var(--color-input-bg)] [border-radius:4px] [max-width:90%] [border-left:3px_solid_var(--color-active)]" onClick={() => scrollToMessage(parentMsg.id)}>
      <div className="[width:16px] [height:16px] [border-radius:50%] [background:var(--color-deactive)] [overflow:hidden]">{parentMsg.profileImg ? <img src={getImageUrl(parentMsg.profileImg)} alt={displayName(parentMsg.nickname)} /> : displayName(parentMsg.nickname).slice(0, 1)}</div>
      <span className="[font-weight:700] [color:var(--color-active)] [font-size:12px]">{displayName(parentMsg.nickname)}</span>
      <span className="[color:var(--color-text)] [opacity:0.7] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis] [font-size:12px]">{parentMsg.isDeleted ? "삭제된 메시지" : formatChatPreview(parentMsg.content)}</span>
    </div>
  );
}

function ReactionBadges({ reactionMap, msgId, toggleReaction }) {
  if (Object.keys(reactionMap).length === 0) return null;
  return <div className="[display:flex] [flex-wrap:wrap] [gap:4px] [margin-top:4px]">
    {Object.entries(reactionMap).map(([emoji, { count, mine }]) => <button key={emoji} type="button" onClick={() => toggleReaction(msgId, emoji)} className={mine ? "[border:1px_solid_var(--color-active)]" : ""}>{emoji} {count}</button>)}
  </div>;
}

export default function ChatMessageItem({ msg, idx, messages, userId, reactionMap: externalReactionMap, reactions, toggleReaction, showEmojiPicker, setShowEmojiPicker, startReply, startEdit, handleDelete, setShowCustomizer, scrollToMessage, setSelectedProfileId, hoveredMsgId, setHoveredMsgId, variant = "group", roomAuthor }) {
  const prevMsg = idx > 0 ? messages[idx - 1] : null;
  const showDateDivider = !isSameDay(prevMsg?.time, msg.time);
  const compact = !showDateDivider && isCompact(prevMsg, msg);
  const isMine = String(msg.userId) === String(userId);
  const parentMsg = msg.parentId ? messages.find((item) => item.id === msg.parentId) : null;
  const reactionMap = externalReactionMap || (msg.reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) acc[reaction.emoji] = { count: 0, mine: false };
    acc[reaction.emoji].count += 1;
    if (String(reaction.userId || reaction.user_id) === String(userId)) acc[reaction.emoji].mine = true;
    return acc;
  }, {});
  if (msg.isSystem) {
    return <SystemChatMessage msg={msg} idx={idx} showDateDivider={showDateDivider} formatDate={formatDate} />;
  }

  return (
    <div key={msg.id || idx}>
      {showDateDivider && <div className="[display:flex] [align-items:center] [gap:8px] [padding:12px_8px] [margin:4px_0]"><span className="[font-size:11px] [font-weight:600] [color:#888]">{formatDate(msg.time)}</span></div>}
      <div id={`msg-${msg.id}`} className={compact ? "[display:flex] [padding:1px_8px] [position:relative]" : "[display:flex] [padding:2px_8px] [position:relative] [margin-top:16px]"} onMouseEnter={() => setHoveredMsgId(msg.id)} onMouseLeave={() => setHoveredMsgId(null)}>
        <div className="[width:40px] [flex-shrink:0] [display:flex] [justify-content:center] [padding-top:2px]">
          {compact ? <span className="[font-size:10px] [color:#888]">{formatTime(msg.time)}</span> : <ChatMessageAvatar profileImg={msg.profileImg} nickname={msg.nickname} isHost={variant === "group" && displayName(msg.nickname) === roomAuthor} onClick={() => setSelectedProfileId(msg.userId)} />}
        </div>
        <div className="[flex:1] [min-width:0] [padding-left:12px]">
          {!compact && <div className="[display:flex] [align-items:baseline] [gap:8px] [margin-bottom:2px]"><span className={isMine ? "[font-size:15px] [font-weight:600] [color:var(--color-active)]" : "[font-size:15px] [font-weight:600] [color:var(--color-text)]"} onClick={() => setSelectedProfileId(msg.userId)}>{displayName(msg.nickname)}</span><span className="[font-size:11px] [color:#888]">{formatTime(msg.time)}</span></div>}
          <ReplyPreview parentMsg={parentMsg} scrollToMessage={scrollToMessage} />
          <div className={msg.isDeleted ? "[font-size:15px] [color:#888] [font-style:italic]" : "[font-size:15px] [line-height:1.5] [word-break:break-word] [color:var(--color-text)]"}>
            <MessageRowErrorBoundary fallbackText={msg.content}><ChatMessageContent content={msg.content} /></MessageRowErrorBoundary>
            {msg.isEdited && !msg.isDeleted && <span className="[font-size:10px] [color:#888] [font-style:italic] [margin-left:4px]">(수정됨)</span>}
          </div>
          {isMine && msg.readCount > 0 && <div className="[font-size:10px] [color:var(--color-active)] [font-weight:700] [margin-top:2px]">{msg.readCount}명 읽음</div>}
          <ReactionBadges reactionMap={reactionMap} msgId={msg.id} toggleReaction={toggleReaction} />
        </div>
        {hoveredMsgId === msg.id && !msg.isDeleted && !msg.isPending && !msg.isFailed && <MessageActionToolbar msg={msg} reactions={reactions} toggleReaction={toggleReaction} showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker} startReply={startReply} startEdit={startEdit} handleDelete={handleDelete} setShowCustomizer={setShowCustomizer} isMine={isMine} />}
      </div>
    </div>
  );
}

export { ChatMessageAvatar };
