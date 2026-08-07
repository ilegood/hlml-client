import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { getEditableMessageText } from "../../utils/chatHelpers";

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
}) {
  const contextText = replyTo
    ? formatChatPreview(replyTo.content)
    : getEditableMessageText(messages.find((message) => message.id === editId)?.content);

  return (
    <>
      {(replyTo || editId) && (
        <div className={"[background:var(--color-input-bg)] [border-top:1px_solid_var(--color-border)] [padding:10px_8px_10px_12px] [display:flex] [justify-content:space-between] [align-items:center] [animation:slideUp_0.15s_ease-out] [flex-shrink:0] [margin:0_8px] [border-radius:8px_8px_0_0] [border:1px_solid_var(--color-border)] [border-bottom:none]"}>
          <div>
            <div className={"[font-size:11px] [font-weight:700] [color:var(--color-active)] [display:flex] [align-items:center] [gap:6px] [margin-bottom:2px] [text-transform:uppercase] [letter-spacing:0.5px]"}>
              {replyTo
                ? `${replyTo.nickname || "사용자"}님에게 답장 중`
                : "메시지 수정 중"}
            </div>
            <div className={"[font-size:13px] [color:var(--color-text)] [opacity:0.8] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis] [max-width:500px]"}>{contextText}</div>
          </div>
          <button
            type="button"
            className={"[background:none] [border:none] [cursor:pointer] [color:#888] [padding:4px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [font-size:20px] [line-height:1] hover:[color:var(--color-text)] hover:[background:var(--color-input-bg)]"}
            aria-label="닫기"
            title="닫기"
            onClick={cancelContext}
          >
            ×
          </button>
        </div>
      )}

      <div className={"[padding:0_8px_8px] [background:var(--color-bg)] [flex-shrink:0] [position:relative]"}>
        {pendingFiles.length > 0 && (
          <div className={"[display:flex] [align-items:center] [gap:8px] [overflow-x:auto] [padding:8px] [border:1px_solid_var(--color-border)] [border-bottom:none] [border-radius:8px_8px_0_0] [background:var(--color-input-bg)]"}>
            {pendingFiles.map((item) => (
              <div className={"[position:relative] [width:88px] [height:88px] [flex:0_0_auto] [border:1px_solid_var(--color-border)] [border-radius:6px] [overflow:hidden]"} key={item.id}>
                {item.file.type.startsWith("video/") ? (
                  <video
                    className={"[width:100%] [height:100%] [object-fit:contain] [display:block]"}
                    src={item.previewUrl}
                    muted
                  />
                ) : item.file.type.startsWith("image/") ? (
                  <img
                    className={"[width:100%] [height:100%] [object-fit:contain] [display:block]"}
                    src={item.previewUrl}
                    alt={item.file.name}
                  />
                ) : (
                  <div className={"[display:flex] [width:100%] [height:100%] [flex-direction:column] [align-items:center] [justify-content:center] [gap:7px] [padding:10px_8px_8px] [box-sizing:border-box] [background:var(--color-sidebar)] [color:var(--color-text)]"}>
                    <span className={"[width:100%] [min-width:0] [overflow:hidden] [color:var(--color-text)] [font-size:11px] [font-weight:700] [line-height:1.25] [text-align:center] [text-overflow:ellipsis] [white-space:nowrap]"}>
                      {item.file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={"[position:absolute] [top:4px] [right:4px] [width:22px] [height:22px] [border:none] [border-radius:50%] [background:rgba(0,_0,_0,_0.72)] [color:#fff] [cursor:pointer] [line-height:1] [display:flex] [align-items:center] [justify-content:center] [font-size:16px]"}
                  title="첨부 삭제"
                  disabled={sending}
                  onClick={() => removePendingFile(item.id)}
                >
                  X
                </button>
              </div>
            ))}
            {sending && (
              <div className={"[display:inline-flex] [align-items:center] [min-height:34px] [flex:0_0_auto] [padding:0_12px] [border:1px_solid_var(--color-border)] [border-radius:999px] [background:var(--color-sidebar)] [color:var(--color-active)] [font-size:13px] [font-weight:800] [white-space:nowrap]"} role="status">
                업로드 중...
              </div>
            )}
          </div>
        )}

        <div className={"[display:flex] [align-items:flex-end] [background:var(--color-input-bg)] [border-radius:8px] [border:1px_solid_var(--color-border)] [padding:6px_8px_6px_14px] [gap:8px] [transition:border-color_0.2s]"}>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            multiple
            className={"[display:none]"}
            disabled={Boolean(editId)}
            onChange={(event) => addPendingFiles(event.target.files)}
          />
          {showAttachMenu && !editId && (
            <div className={"[position:absolute] [left:14px] [bottom:calc(100%_+_8px)] [z-index:1200] [min-width:160px] [padding:6px] [border:1px_solid_var(--color-active)] [border-radius:8px] [background:var(--color-dropdown-bg)] [box-shadow:0_10px_28px_var(--color-dropdown-shadow)]"}>
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
            className={"[width:32px] [height:32px] [align-self:center] [border:none] [border-radius:4px] [background:transparent] [color:#888] [font-size:24px] [line-height:1] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [transition:background_0.15s,_color_0.15s]"}
            title="파일 첨부"
            disabled={sending || Boolean(editId)}
            onClick={() => setShowAttachMenu((prev) => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <textarea
            ref={inputRef}
            className={"[flex:1] [display:block] [align-self:center] [width:100%] [min-width:0] [padding:6px_0] [border:none] [background:transparent] [color:var(--color-text)] [font-size:14px] [outline:none] [resize:none] [font-family:inherit] [line-height:1.5] [min-height:33px] [max-height:160px] [overflow-y:hidden] [white-space:pre-wrap] [box-sizing:border-box]"}
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
          <div className={"[display:flex] [align-items:center] [gap:2px] [flex-shrink:0] [padding-bottom:1px]"}>
            <button
              type="button"
              className={"[background:none] [border:none] [cursor:pointer] [color:#888] [width:32px] [height:32px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [font-size:18px] [transition:color_0.15s] hover:[color:var(--color-text)]"}
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
                className={"[position:absolute] [bottom:calc(100%_+_8px)] [right:8px] [z-index:1000] [box-shadow:0_8px_24px_rgba(0,_0,_0,_0.3)] [border-radius:10px] [overflow:hidden]"}
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
              className={"[width:32px] [height:32px] [border-radius:4px] [background:var(--color-active)] [border:none] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [transition:opacity_0.15s] hover:[opacity:0.85]"}
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
