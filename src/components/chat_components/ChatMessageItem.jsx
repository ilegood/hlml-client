import { useNavigate } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";
import { getImageUrl } from "../../api/instance";
import { ChatMessageContent } from "./ChatAttachment";
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
      className={styles.avatarWrapSmall}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {isHost && (
        <img
          src={borderImg}
          className={styles.avatarBorderSmall}
          alt="host-border"
        />
      )}
      <div
        className={styles.msgAvatar}
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
      className={styles.replyPreviewInMsg}
      onClick={() => scrollToMessage(parentMsg.id)}
    >
      <div className={styles.replyAvatar}>
        {parentMsg.profileImg ? (
          <img
            src={getImageUrl(parentMsg.profileImg)}
            alt={displayName(parentMsg.nickname)}
          />
        ) : (
          displayName(parentMsg.nickname).slice(0, 1)
        )}
      </div>
      <span className={styles.replyName}>
        {displayName(parentMsg.nickname)}
      </span>
      <span className={styles.replyContent}>
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
    <div className={styles.reactionsArea}>
      {Object.entries(reactionMap).map(([emoji, { count, mine }]) => (
        <div
          key={emoji}
          className={`${styles.reactionBadge} ${mine ? styles.activeReaction : ""}`}
          onClick={() => toggleReaction(msgId, emoji)}
        >
          {emoji}
          <span className={styles.reactionCount}>{count}</span>
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
    <div className={styles.msgActions} onClick={(e) => e.stopPropagation()}>
      <div className={styles.quickReactions}>
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
        <button
          type="button"
          className={styles.editReactionBtn}
          title="반응 커스텀"
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
            <path d="M18.36 18.36l1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="M4.22 19.78l1.42-1.42" />
            <path d="M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      <div className={styles.actionDivider} />

      <button
        type="button"
        title="반응 추가"
        onClick={(e) => {
          e.stopPropagation();
          setShowEmojiPicker(msg.id);
        }}
        style={{ position: "relative" }}
      >
        😊
        {showEmojiPicker === msg.id && (
          <div
            className={styles.emojiPickerPopup}
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
          <div className={styles.dateDivider}>
            <span className={styles.dateDividerText}>
              {formatDate(msg.time)}
            </span>
          </div>
        )}
        <div
          className={
            msg.isDeletionWarning ? styles.deletionWarningMsg : styles.systemMsg
          }
        >
          {systemText}
        </div>
        {parsed?.kind === "share_post" && (
          <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
            <button
              type="button"
              onClick={() => navigate(`/chat-rooms/${parsed.postId}`)}
              style={{
                height: 32,
                padding: "0 16px",
                border: "none",
                borderRadius: 6,
                background: "var(--color-active)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              참여하기
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div key={msg.id || idx}>
      {showDateDivider && (
        <div className={styles.dateDivider}>
          <span className={styles.dateDividerText}>{formatDate(msg.time)}</span>
        </div>
      )}

      <div
        id={`msg-${msg.id}`}
        className={`${styles.msgRow} ${compact ? styles.compact : styles.msgGroupStart}`}
        onMouseEnter={() => setHoveredMsgId(msg.id)}
        onMouseLeave={() => setHoveredMsgId(null)}
      >
        <div className={styles.msgAvatarWrap}>
          {compact ? (
            <span className={styles.compactTime}>{formatTime(msg.time)}</span>
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

        <div className={styles.msgContent}>
          {!compact && (
            <div className={styles.msgHeader}>
              <span
                className={`${styles.msgNickname} ${isMine ? styles.msgNicknameMine : ""}`}
                onClick={() => setSelectedProfileId(msg.userId)}
                style={{ cursor: "pointer" }}
              >
                {displayName(msg.nickname)}
              </span>
              {variant === "group" &&
                displayName(msg.nickname) === roomAuthor && (
                  <span className={styles.msgHostBadge}>방장</span>
                )}
              <span className={styles.msgTimestamp}>
                {formatTime(msg.time)}
              </span>
            </div>
          )}

          <ReplyPreview
            parentMsg={parentMsg}
            scrollToMessage={scrollToMessage}
          />

          <div
            className={`${styles.msgBubble} ${msg.isDeleted ? styles.deleted : ""} ${msg.isPending ? styles.pendingMessage : ""} ${msg.isFailed ? styles.failedMessage : ""}`}
          >
            <ChatMessageContent content={msg.content} />
            {msg.isEdited && !msg.isDeleted && (
              <span className={styles.editedTag}>(수정됨)</span>
            )}
          </div>

          {isMine && msg.readCount > 0 && (
            <div className={styles.readCount}>{msg.readCount}명 읽음</div>
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
