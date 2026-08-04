import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getImageUrl } from "../../api/instance";
import {
  ChatMessageContent,
  MessageRowErrorBoundary,
} from "./ChatAttachment";
import { Avatar } from "./ChatMessageItem";
import MapPreview from "../post_components/MapPreview";
import styles from "./chatStyles.js";
import {
  formatTime,
  formatDate,
  isSameDay,
  isCompact,
  displayName,
  parseSystemMessagePayload,
} from "../../utils/chatHelpers";
import { formatChatPreview } from "../../utils/chatPreview";

const QUICK_REACTIONS = ["👍", "❤️", "😂"];

const DateDivider = ({ time }) => (
  <div className={styles.dateDivider}>
    <span className={styles.dateDividerText}>{formatDate(time)}</span>
  </div>
);

const buildReactionMap = (reactions, userId) =>
  (reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, mine: false };
    }
    acc[reaction.emoji].count += 1;
    if (String(reaction.userId || reaction.user_id) === String(userId)) {
      acc[reaction.emoji].mine = true;
    }
    return acc;
  }, {});

const getSystemMessageText = (systemPayload, fallbackContent) => {
  if (!systemPayload) return fallbackContent;

  if (systemPayload.kind === "share_post") {
    const sharer = systemPayload.sharerNickname || "알 수 없음";
    const title = systemPayload.postTitle || "게시글";
    return `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
  }

  return systemPayload.text || fallbackContent;
};

const SystemMessage = ({ msg, navigate }) => {
  const systemPayload = parseSystemMessagePayload(msg.content);
  const isSharePost = systemPayload?.kind === "share_post";
  const isAppointmentChange = systemPayload?.kind === "appointment_change";
  const hasMap =
    isAppointmentChange &&
    systemPayload.showMap &&
    Number.isFinite(systemPayload.latitude) &&
    Number.isFinite(systemPayload.longitude);
  const systemClass = msg.isDeletionWarning
    ? styles.deletionWarningMsg
    : styles.systemMsg;
  const displaySystemText = getSystemMessageText(systemPayload, msg.content);

  return (
    <>
      <div className={systemClass}>
        <span>{displaySystemText}</span>
        {hasMap && (
          <div className={styles.systemMsgMap}>
            <MapPreview
              latitude={systemPayload.latitude}
              longitude={systemPayload.longitude}
            />
          </div>
        )}
      </div>

      {isSharePost && (
        <>
          <div className="py-1 pb-2 text-center">
            <button
              type="button"
              onClick={() => navigate(`/chat-rooms/${systemPayload.postId}`)}
              className="h-8 rounded-md border-0 bg-[var(--color-active)] px-4 text-[13px] font-bold text-white"
            >
              참여하기
            </button>
          </div>

          <button
            type="button"
            className={styles.sharedPostCard}
            onClick={() => navigate(`/detail/${systemPayload.postId}`)}
            disabled={!systemPayload.postId}
          >
            {systemPayload.postImage && (
              <div className={styles.sharedPostImageContainer}>
                <img
                  src={getImageUrl(systemPayload.postImage)}
                  alt="공유된 게시글"
                  className={styles.sharedPostImage}
                />
              </div>
            )}
            <div className={styles.sharedPostContent}>
              <span className={styles.sharedPostEyebrow}>공유된 게시글</span>
              <strong className={styles.sharedPostTitle}>
                {systemPayload.postTitle || "게시글"}
              </strong>
              <span className={styles.sharedPostMeta}>
                {systemPayload.sharerNickname || "알 수 없음"}님이
                공유했습니다. 클릭하면 게시글로 이동합니다.
              </span>
            </div>
          </button>
        </>
      )}
    </>
  );
};

const MessageActions = ({
  msg,
  isMine,
  showEmojiPicker,
  setShowEmojiPicker,
  toggleReaction,
  startReply,
  startEdit,
  handleDelete,
}) => (
  <div className={styles.msgActions} onClick={(e) => e.stopPropagation()}>
    <div className={styles.quickReactions}>
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          title={emoji}
          onClick={() => toggleReaction(msg.id, emoji)}
        >
          {emoji}
        </button>
      ))}
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
        <button type="button" title="삭제" onClick={() => handleDelete(msg.id)}>
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

const ChatRoomMessageList = ({
  messages,
  userId,
  messagesRef,
  bottomRef,
  handleScroll,
  roomAuthor,
  navigate,
  showEmojiPicker,
  setShowEmojiPicker,
  toggleReaction,
  startReply,
  startEdit,
  handleDelete,
  scrollToMessage,
  setSelectedProfileId,
  hoveredMsgId,
  setHoveredMsgId,
}) => {
  return (
    <div
      className={styles.messages}
      ref={messagesRef}
      onScroll={handleScroll}
    >
      {messages.map((msg, idx) => {
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showDateDivider = !isSameDay(prevMsg?.time, msg.time);

        if (msg.isSystem) {
          return (
            <div key={msg.id || idx}>
              {showDateDivider && <DateDivider time={msg.time} />}
              <SystemMessage msg={msg} navigate={navigate} />
            </div>
          );
        }

        const compact = !showDateDivider && isCompact(prevMsg, msg);
        const isMine = String(msg.userId) === String(userId);
        const parentMsg = msg.parentId
          ? messages.find((message) => message.id === msg.parentId)
          : null;
        const msgNickname = displayName(msg.nickname);
        const reactionMap = buildReactionMap(msg.reactions, userId);

        return (
          <div key={msg.id || idx}>
            {showDateDivider && <DateDivider time={msg.time} />}

            <div
              id={`msg-${msg.id}`}
              className={`${styles.msgRow} ${
                compact ? styles.compact : styles.msgGroupStart
              }`}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              <div className={styles.msgAvatarWrap}>
                {compact ? (
                  <span className={styles.compactTime}>
                    {formatTime(msg.time)}
                  </span>
                ) : (
                  <Avatar
                    profileImg={msg.profileImg}
                    nickname={msgNickname}
                    isHost={msgNickname === roomAuthor}
                    onClick={() => setSelectedProfileId(msg.userId)}
                  />
                )}
              </div>

              <div className={styles.msgContent}>
                {!compact && (
                  <div className={styles.msgHeader}>
                    <span
                      className={`${styles.msgNickname} ${
                        isMine ? styles.msgNicknameMine : ""
                      }`}
                      onClick={() => setSelectedProfileId(msg.userId)}
                    >
                      {msgNickname}
                    </span>
                    {msgNickname === roomAuthor && (
                      <span className={styles.msgHostBadge}>방장</span>
                    )}
                    <span className={styles.msgTimestamp}>
                      {formatTime(msg.time)}
                    </span>
                  </div>
                )}

                {parentMsg && (
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
                )}

                <MessageRowErrorBoundary fallbackText={msg.content}>
                  <div
                    className={`${styles.msgBubble} ${
                      msg.isDeleted ? styles.deleted : ""
                    } ${msg.isPending ? styles.pendingMessage : ""} ${
                      msg.isFailed ? styles.failedMessage : ""
                    }`}
                  >
                    <ChatMessageContent content={msg.content} />
                    {msg.isEdited && !msg.isDeleted && (
                      <span className={styles.editedTag}>(수정됨)</span>
                    )}
                  </div>
                </MessageRowErrorBoundary>

                {isMine && msg.readCount > 0 && (
                  <div className={styles.readCount}>
                    {msg.readCount}명 읽음
                  </div>
                )}

                {Object.keys(reactionMap).length > 0 && (
                  <div className={styles.reactionsArea}>
                    {Object.entries(reactionMap).map(
                      ([emoji, { count, mine }]) => (
                        <div
                          key={emoji}
                          className={`${styles.reactionBadge} ${
                            mine ? styles.activeReaction : ""
                          }`}
                          onClick={() => toggleReaction(msg.id, emoji)}
                        >
                          {emoji}
                          <span className={styles.reactionCount}>{count}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {hoveredMsgId === msg.id &&
                !msg.isDeleted &&
                !msg.isPending &&
                !msg.isFailed && (
                  <MessageActions
                    msg={msg}
                    isMine={isMine}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    toggleReaction={toggleReaction}
                    startReply={startReply}
                    startEdit={startEdit}
                    handleDelete={handleDelete}
                  />
                )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatRoomMessageList;
