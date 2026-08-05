import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import styles from "./chatStyles.js";
import ChatScrollButton from "./ChatScrollButton";

export default function ChatInputArea({
  input,
  setInput,
  handleSend,
  sending,
  editId,
  replyTo,
  cancelContext,
  pendingFiles,
  removePendingFile,
  addPendingFiles,
  openFilePicker,
  handlePaste,
  handleEmojiSelect,
  inputRef,
  fileInputRef,
  fileAccept,
  showAttachMenu,
  setShowAttachMenu,
  showMainEmojiPicker,
  setShowMainEmojiPicker,
  roomTitle,
  roomId,
  formatChatPreview,
  messages,
  onInputChange,
  onInput,
  onCompositionEnd,
  showScrollBtn,
  scrollToBottom,
}) {
  const contextText = replyTo
    ? formatChatPreview(replyTo.content)
    : formatChatPreview(
        messages.find((message) => message.id === editId)?.content,
      );

  return (
    <>
      {(replyTo || editId) && (
        <div className={styles.inputContext}>
          <div>
            <div className={styles.contextLabel}>
              {replyTo
                ? `${replyTo.nickname || "사용자"}님에게 답장 중`
                : "메시지 수정 중"}
            </div>
            <div className={styles.contextText}>{contextText}</div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="닫기"
            title="닫기"
            onClick={cancelContext}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.inputArea}>
        {showScrollBtn && (
          <ChatScrollButton
            onClick={scrollToBottom}
            title="최근 채팅 확인하기"
            ariaLabel="최근 채팅 확인하기"
            label="최근 채팅 확인하기"
          />
        )}
        {pendingFiles.length > 0 && (
          <div className={styles.pendingAttachments}>
            {pendingFiles.map((item) => (
              <div className={styles.pendingItem} key={item.id}>
                {item.file.type.startsWith("video/") ? (
                  <video
                    className={styles.pendingThumb}
                    src={item.previewUrl}
                    muted
                  />
                ) : item.file.type.startsWith("image/") ? (
                  <img
                    className={styles.pendingThumb}
                    src={item.previewUrl}
                    alt={item.file.name}
                  />
                ) : (
                  <div className={styles.pendingFilePreview}>
                    <span className={styles.pendingFileName}>
                      {item.file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={styles.pendingRemove}
                  title="첨부 삭제"
                  disabled={sending}
                  onClick={() => removePendingFile(item.id)}
                >
                  X
                </button>
              </div>
            ))}
            {sending && (
              <div className={styles.uploadStatus} role="status">
                업로드 중...
              </div>
            )}
          </div>
        )}

        <div className={styles.inputBox}>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            multiple
            className={styles.fileInput}
            onChange={(event) => addPendingFiles(event.target.files)}
          />
          {showAttachMenu && (
            <div className={styles.attachMenu}>
              <button
                type="button"
                onClick={() => openFilePicker("image/*,video/*")}
              >
                사진/동영상
              </button>
              <button type="button" onClick={() => openFilePicker("")}>
                파일
              </button>
            </div>
          )}
          <button
            type="button"
            className={styles.attachBtn}
            title="파일 첨부"
            disabled={sending}
            onClick={() => setShowAttachMenu((prev) => !prev)}
          >
            +
          </button>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(event) =>
              onInputChange
                ? onInputChange(event)
                : setInput(event.target.value)
            }
            onInput={onInput}
            onCompositionEnd={onCompositionEnd}
            onPaste={handlePaste}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              editId
                ? "메시지 수정..."
                : replyTo
                  ? `${replyTo.nickname || "사용자"}님에게 답장...`
                  : `#${roomTitle || roomId}에 메시지 보내기`
            }
            rows={1}
          />
          <div className={styles.inputActions}>
            <button
              type="button"
              className={styles.inputIconBtn}
              title="이모지"
              onClick={(event) => {
                event.stopPropagation();
                setShowMainEmojiPicker((prev) => !prev);
              }}
            >
              🙂
            </button>
            {showMainEmojiPicker && (
              <div
                className={styles.mainEmojiPicker}
                onClick={(event) => event.stopPropagation()}
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                  locale="ko"
                />
              </div>
            )}
            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={sending}
              title="전송"
            >
              <svg
                style={{ pointerEvents: "none" }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
