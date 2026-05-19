import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";
import { displayName } from "../../utils/chatHelpers";

export default function ChatInputArea({
  input, setInput, handleSend, sending, editId, replyTo, cancelContext,
  pendingFiles, removePendingFile, addPendingFiles, openFilePicker,
  handlePaste, handleEmojiSelect,
  inputRef, fileInputRef, fileAccept, showAttachMenu, setShowAttachMenu,
  showMainEmojiPicker, setShowMainEmojiPicker, roomTitle, roomId, targetNickname,
  formatChatPreview: formatPreview,
  messages,
  placeholder,
}) {
  const inputPlaceholder = placeholder || (editId
    ? "메시지 수정..."
    : replyTo
      ? `@${displayName(replyTo.nickname)}님에게 답장...`
      : targetNickname
        ? `${targetNickname}님에게 메시지 보내기`
        : `#${roomTitle || roomId}에 메시지 보내기`);

  return (
    <>
      {(replyTo || editId) && (
        <div className={styles.inputContext}>
          <div>
            <div className={styles.contextLabel}>
              {replyTo ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                  {displayName(replyTo.nickname)}님에게 답장 중
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  메시지 수정 중
                </>
              )}
            </div>
            <div className={styles.contextText}>
              {replyTo
                ? formatPreview(replyTo.content)
                : formatPreview(messages.find((m) => m.id === editId)?.content)}
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={cancelContext}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className={styles.inputArea}>
        {pendingFiles.length > 0 && (
          <div className={styles.pendingAttachments}>
            {pendingFiles.map((item) => (
              <div className={styles.pendingItem} key={item.id}>
                {item.file.type.startsWith("video/") ? (
                  <video className={styles.pendingThumb} src={item.previewUrl} muted />
                ) : item.file.type.startsWith("image/") ? (
                  <img className={styles.pendingThumb} src={item.previewUrl} alt={item.file.name} />
                ) : (
                  <div className={styles.pendingFilePreview}>
                    <span className={styles.pendingFileIcon}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <span className={styles.pendingFileName}>{item.file.name}</span>
                  </div>
                )}
                <button type="button" className={styles.pendingRemove} title="첨부 삭제" onClick={() => removePendingFile(item.id)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputBox}>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            multiple
            className={styles.fileInput}
            onChange={(e) => addPendingFiles(e.target.files)}
          />
          {showAttachMenu && (
            <div className={styles.attachMenu}>
              <button type="button" onClick={() => openFilePicker("image/*,video/*")}>이미지/동영상 선택</button>
              <button type="button" onClick={() => openFilePicker("")}>일반 파일 선택</button>
            </div>
          )}
          <button
            type="button"
            className={styles.attachBtn}
            title="파일 추가"
            disabled={sending}
            onClick={() => setShowAttachMenu((prev) => !prev)}
          >+</button>

          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => handlePaste(e, addPendingFiles)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={inputPlaceholder}
          />

          <div className={styles.inputActions}>
            <button
              className={styles.inputIconBtn} title="이모티콘"
              onClick={(e) => { e.stopPropagation(); setShowMainEmojiPicker(!showMainEmojiPicker); }}
            >😊</button>
            {showMainEmojiPicker && (
              <div className={styles.mainEmojiPicker} onClick={(e) => e.stopPropagation()}>
                <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" locale="ko" />
              </div>
            )}
            <button
              type="button"
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={sending}
              title="전송"
            >
              <svg style={{ pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
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
