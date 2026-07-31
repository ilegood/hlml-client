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
        const compact = !showDateDivider && isCompact(prevMsg, msg);
        const isMine = String(msg.userId) === String(userId);
        const parentMsg = msg.parentId
          ? messages.find((m) => m.id === msg.parentId)
          : null;
        const msgNickname = displayName(msg.nickname);

        // 리액션 집계
        const reactionMap = (msg.reactions || []).reduce((acc, r) => {
          if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
          acc[r.emoji].count++;
          if (String(r.userId || r.user_id) === String(userId))
            acc[r.emoji].mine = true;
          return acc;
        }, {});

        if (msg.isSystem) {
          const systemPayload = parseSystemMessagePayload(msg.content);
          const hasMap =
            systemPayload?.kind === "appointment_change" &&
            systemPayload.showMap &&
            Number.isFinite(systemPayload.latitude) &&
            Number.isFinite(systemPayload.longitude);
          const isSharePost = systemPayload?.kind === "share_post";
          const isAppointmentChange =
            systemPayload?.kind === "appointment_change";
          let displaySystemText = systemPayload?.text || msg.content;

          if (isSharePost) {
            const sharer = systemPayload.sharerNickname || "알 수 없음";
            const title = systemPayload.postTitle || "게시글";
            displaySystemText = `${sharer}님이 "${title}" 게시글을 공유했습니다.`;
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
              {isSharePost && (
                <div
                  className={
                    msg.isDeletionWarning
                      ? styles.deletionWarningMsg
                      : styles.systemMsg
                  }
                >
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
              )}
              {isSharePost && (
                <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/chat-rooms/${systemPayload.postId}`)}
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
                  <span className={styles.dateDividerText}>
                    {formatDate(msg.time)}
                  </span>
                </div>
              )}
              {isSharePost ? (
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
                        alt="Post"
                        className={styles.sharedPostImage}
                      />
                    </div>
                  )}
                  <div className={styles.sharedPostContent}>
                    <span className={styles.sharedPostEyebrow}>
                      공유된 게시글
                    </span>
                    <strong className={styles.sharedPostTitle}>
                      {systemPayload.postTitle || "게시글"}
                    </strong>
                    <span className={styles.sharedPostMeta}>
                      {systemPayload.sharerNickname || "알 수 없음"}님이
                      공유했습니다. 클릭하면 게시글로 이동합니다.
                    </span>
                  </div>
                </button>
              ) : (
                <div
                  className={
                    msg.isDeletionWarning
                      ? styles.deletionWarningMsg
                      : styles.systemMsg
                  }
                >
                  <span>{displaySystemText}</span>
                  {isAppointmentChange &&
                    systemPayload.showMap &&
                    Number.isFinite(systemPayload.latitude) &&
                    Number.isFinite(systemPayload.longitude) && (
                      <div className={styles.systemMsgMap}>
                        <MapPreview
                          latitude={systemPayload.latitude}
                          longitude={systemPayload.longitude}
                        />
                      </div>
                    )}
                </div>
              )}
            </div>
          );
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
              id={`msg-${msg.id}`}
              className={`${styles.msgRow} ${compact ? styles.compact : styles.msgGroupStart}`}
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
                      className={`${styles.msgNickname} ${isMine ? styles.msgNicknameMine : ""}`}
                      onClick={() => setSelectedProfileId(msg.userId)}
                      style={{ cursor: "pointer" }}
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
                    className={`${styles.msgBubble} ${msg.isDeleted ? styles.deleted : ""} ${msg.isPending ? styles.pendingMessage : ""} ${msg.isFailed ? styles.failedMessage : ""}`}
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
                          className={`${styles.reactionBadge} ${mine ? styles.activeReaction : ""}`}
                          onClick={() => toggleReaction(msg.id, emoji)}
                        >
                          {emoji}
                          <span className={styles.reactionCount}>
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* ── Action toolbar (항상 오른쪽 끝) ── */}
              {hoveredMsgId === msg.id &&
                !msg.isDeleted &&
                !msg.isPending &&
                !msg.isFailed && (
                  <div
                    className={styles.msgActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 빠른 반응 */}
                    <div className={styles.quickReactions}>
                      {["👍", "❤️", "😂"].map((emoji) => (
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

                    {/* 반응 더 추가 */}
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
                            onEmojiSelect={(emoji) =>
                              toggleReaction(msg.id, emoji.native)
                            }
                            theme="dark"
                            locale="ko"
                          />
                        </div>
                      )}
                    </button>

                    {/* 답장 */}
                    <button
                      type="button"
                      title="답장"
                      onClick={() => startReply(msg)}
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
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>

                    {isMine && (
                      <>
                        {/* 수정 */}
                        <button
                          type="button"
                          title="수정"
                          onClick={() => startEdit(msg)}
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
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {/* 삭제 */}
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
