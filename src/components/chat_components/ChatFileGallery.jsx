import { useCallback, useState } from "react";
import { getImageUrl } from "../../api/instance";
import { MediaLightbox } from "./ChatAttachment";

const countHangul = (value) =>
  (String(value).match(/[\uAC00-\uD7A3]/g) || []).length;

const repairFilename = (name) => {
  const value = String(name || "");
  if (!value) return "";

  try {
    const bytes = Uint8Array.from(
      [...value].map((char) => char.charCodeAt(0) & 0xff),
    );
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return countHangul(decoded) > countHangul(value) ? decoded : value;
  } catch {
    return value;
  }
};

const formatFileSize = (size) => {
  const bytes = Number(size);
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10}KB`;
  return `${Math.round(bytes / 1024 / 102.4) / 10}MB`;
};

const formatSentAt = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

const parseMessageAttachments = (message) => {
  try {
    const parsed = JSON.parse(message.content);
    const attachments =
      parsed?.kind === "chat_payload" && Array.isArray(parsed.attachments)
        ? parsed.attachments
        : parsed?.kind === "chat_attachment"
          ? [parsed]
          : [];

    return attachments.filter(Boolean).map((attachment, index) => ({
      ...attachment,
      id: `${message.id || "message"}-${index}`,
      sender: message.nickname,
      sentAt: message.time || message.created_at,
    }));
  } catch {
    return [];
  }
};

const isMedia = (attachment) => {
  const mimeType = attachment.mimeType || "";
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    attachment.resourceType === "image" ||
    attachment.resourceType === "video"
  );
};

const getDownloadUrl = (attachment) =>
  attachment.downloadUrl || getImageUrl(attachment.url);

export default function ChatFileGallery({ messages, onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const attachments = messages.flatMap(parseMessageAttachments).reverse();
  const media = attachments.filter(isMedia);
  const files = attachments.filter((item) => !isMedia(item));
  const mediaCount = media.length;
  const moveLightbox = useCallback(
    (delta) => {
      setLightboxIndex((current) => {
        if (current === null || mediaCount === 0) return current;
        return (current + delta + mediaCount) % mediaCount;
      });
    },
    [mediaCount],
  );

  return (
    <>
      <div className={"[position:fixed] [inset:0] [z-index:10000] [display:flex] [align-items:center] [justify-content:center] [padding:32px] [background:rgba(0,_0,_0,_0.45)] [backdrop-filter:blur(5px)]"} onMouseDown={onClose}>
        <section
          className={"[width:min(760px,_100%)] [max-height:min(720px,_calc(100vh_-_64px))] [display:flex] [flex-direction:column] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-sidebar)] [color:var(--color-text)] [box-shadow:0_20px_60px_rgba(0,_0,_0,_0.28)] [overflow:hidden]"}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={"[display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [padding:18px_20px] [border-bottom:1px_solid_var(--color-border)]"}>
            <div>
              <h3>파일 모아보기</h3>
              <span>{attachments.length}개 공유됨</span>
            </div>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border-0 bg-[var(--color-input-bg)] text-[22px] leading-none text-[var(--color-text)] transition-colors hover:bg-[var(--color-input-focus-bg)]" onClick={onClose} aria-label="닫기" title="닫기">
              ×
            </button>
          </div>

          {attachments.length === 0 ? (
            <div className={"[padding:54px_20px] [color:var(--color-deactive)] [text-align:center] [font-size:14px]"}>
              아직 공유된 파일이 없습니다.
            </div>
          ) : (
            <div className={"[padding:18px_20px_22px] [overflow-y:auto]"}>
              {media.length > 0 && (
                <div className={""}>
                  <div className={"[margin-bottom:10px] [font-size:13px] [font-weight:900] [color:var(--color-text)]"}>이미지/동영상</div>
                  <div className={"[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(132px,_1fr))] [gap:10px]"}>
                    {media.map((attachment, index) => {
                      const src = getImageUrl(attachment.url);
                      const filename = repairFilename(attachment.name) || "미디어";
                      const isVideo =
                        attachment.mimeType?.startsWith("video/") ||
                        attachment.resourceType === "video";

                      return (
                        <button
                          key={attachment.id}
                          type="button"
                          className={"[min-width:0] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-input-bg)] [color:var(--color-text)] [text-decoration:none] [overflow:hidden] [padding:0] [cursor:pointer] [text-align:left]"}
                          title={filename}
                          onClick={() => setLightboxIndex(index)}
                        >
                          {isVideo ? (
                            <video src={src} muted />
                          ) : (
                            <img src={src} alt={filename} />
                          )}
                          <span>{filename}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div className={""}>
                  <div className={"[margin-bottom:10px] [font-size:13px] [font-weight:900] [color:var(--color-text)]"}>파일</div>
                  <div className={"[display:flex] [flex-direction:column] [gap:8px]"}>
                    {files.map((attachment) => {
                      const filename = repairFilename(attachment.name) || "파일";
                      return (
                        <a
                          key={attachment.id}
                          className={"[display:flex] [align-items:center] [gap:12px] [min-width:0] [padding:11px_12px] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-input-bg)] [color:var(--color-text)] [text-decoration:none]"}
                          href={getDownloadUrl(attachment) || "#"}
                          download={filename}
                          title={filename}
                        >
                          <span className={"[width:42px] [height:42px] [border-radius:8px] [background:var(--color-active)] [color:white] [display:flex] [align-items:center] [justify-content:center] [font-size:10px] [font-weight:900] [flex-shrink:0]"}>FILE</span>
                          <span className={"[min-width:0] [display:flex] [flex-direction:column] [gap:4px]"}>
                            <strong>{filename}</strong>
                            <small>
                              {[formatFileSize(attachment.size), formatSentAt(attachment.sentAt)]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          attachments={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onMove={moveLightbox}
        />
      )}
    </>
  );
}
