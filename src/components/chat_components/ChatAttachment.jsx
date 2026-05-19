import { useCallback, useEffect, useState } from "react";
import { getImageUrl } from "../../api/instance";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";

export const parseMessagePayload = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.kind === "chat_payload") {
      return {
        text: parsed.text || "",
        attachments: Array.isArray(parsed.attachments)
          ? parsed.attachments.filter(Boolean)
          : [],
      };
    }
    if (parsed?.kind === "chat_attachment") {
      return { text: "", attachments: [parsed] };
    }
  } catch {
    return null;
  }

  return null;
};

export const getMessagePreviewText = (content, nickname) => {
  const payload = parseMessagePayload(content);
  if (!payload) return content;

  if (payload.attachments.length > 0) {
    const hasImage = payload.attachments.some((a) =>
      a.mimeType?.startsWith("image/"),
    );
    const hasVideo = payload.attachments.some((a) =>
      a.mimeType?.startsWith("video/"),
    );

    if (hasImage) return `${nickname}님의 이미지`;
    if (hasVideo) return `${nickname}님의 동영상`;
    return `${nickname}님의 파일`;
  }

  return payload.text || "";
};

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

const isMedia = (attachment) => {
  const mimeType = attachment.mimeType || "";
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
};

const getDownloadUrl = (attachment) => {
  if (attachment.downloadUrl) return attachment.downloadUrl;
  return getImageUrl(attachment.url);
};

const downloadAttachment = (attachment) => {
  const href = getDownloadUrl(attachment);
  if (!href) return;

  const link = document.createElement("a");
  link.href = href;
  link.download = repairFilename(attachment.name) || "download";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const isSingleEmoji = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;
  const parts = Array.from(text);
  return (
    parts.length <= 2 &&
    /\p{Extended_Pictographic}/u.test(text) &&
    !/[0-9A-Za-z\uAC00-\uD7A3]/u.test(text)
  );
};

export default function ChatAttachment({ attachment }) {
  const filename = repairFilename(attachment.name) || "파일 다운로드";
  const downloadUrl = getDownloadUrl(attachment);

  return (
    <div className={styles.attachmentWrap}>
      <a
        className={styles.attachmentFileCard}
        href={downloadUrl || "#"}
        download={filename}
        title={filename}
        onClick={(event) => {
          if (!downloadUrl) event.preventDefault();
        }}
      >
        <span className={styles.attachmentFileName}>{filename}</span>
        <span className={styles.attachmentDownloadIcon} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </span>
      </a>
    </div>
  );
}

function MediaLightbox({ attachments, index, onClose, onMove }) {
  const attachment = attachments[index];
  const src = getImageUrl(attachment?.url);
  const isVideo = attachment?.mimeType?.startsWith("video/");
  const filename = repairFilename(attachment?.name) || "미디어";

  const downloadAll = () => {
    attachments.forEach((item, itemIndex) => {
      window.setTimeout(() => downloadAttachment(item), itemIndex * 120);
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onMove(-1);
      if (event.key === "ArrowRight") onMove(1);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onMove]);

  if (!attachment) return null;

  return (
    <div className={styles.mediaLightbox} onMouseDown={onClose}>
      <button
        type="button"
        className={styles.lightboxClose}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onClose}
        title="닫기"
      >
        ×
      </button>

      <div
        className={styles.lightboxDownloadActions}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" onClick={() => downloadAttachment(attachment)}>
          현재 파일 다운로드
        </button>
        {attachments.length > 1 && (
          <button type="button" onClick={downloadAll}>
            모두 다운로드
          </button>
        )}
      </div>

      {attachments.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMove(-1)}
            title="이전"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMove(1)}
            title="다음"
          >
            ›
          </button>
        </>
      )}

      <div
        className={styles.lightboxBody}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isVideo ? (
          <video src={src} controls autoPlay />
        ) : (
          <img src={src} alt={filename} />
        )}
        <div className={styles.lightboxMeta}>
          <span>{filename}</span>
          <span>
            {index + 1} / {attachments.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function MediaGrid({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const visible = attachments.slice(0, 4);
  const overflow = attachments.length - visible.length;
  const moveLightbox = useCallback(
    (delta) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        return (current + delta + attachments.length) % attachments.length;
      });
    },
    [attachments.length],
  );

  return (
    <>
      <div
        className={`${styles.mediaGrid} ${
          attachments.length === 1 ? styles.mediaGridSingle : ""
        } ${attachments.length === 2 ? styles.mediaGridTwo : ""} ${
          attachments.length === 3 ? styles.mediaGridThree : ""
        }`}
      >
        {visible.map((attachment, index) => {
          const src = getImageUrl(attachment.url);
          const isVideo = attachment.mimeType?.startsWith("video/");
          const showOverlay = index === visible.length - 1 && overflow > 0;
          const filename = repairFilename(attachment.name) || "미디어 보기";

          return (
            <button
              key={`${attachment.url || attachment.name || "media"}-${index}`}
              type="button"
              className={styles.mediaGridItem}
              onClick={() => setLightboxIndex(index)}
              title={filename}
            >
              {isVideo ? (
                <video src={src} muted />
              ) : (
                <img src={src} alt={filename} />
              )}
              {isVideo && <span className={styles.videoBadge}>동영상</span>}
              {showOverlay && (
                <span className={styles.mediaOverflow}>+{overflow}</span>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          attachments={attachments}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onMove={moveLightbox}
        />
      )}
    </>
  );
}

export function ChatMessageContent({ content }) {
  const payload = parseMessagePayload(content);
  if (!payload) {
    return isSingleEmoji(content) ? (
      <span className={styles.emojiOnly}>{content.trim()}</span>
    ) : (
      content
    );
  }

  const mediaAttachments = payload.attachments.filter(isMedia);
  const fileAttachments = payload.attachments.filter(
    (attachment) => !isMedia(attachment),
  );

  return (
    <div className={styles.messagePayload}>
      {payload.text && (
        <div
          className={`${styles.payloadText} ${
            isSingleEmoji(payload.text) &&
            mediaAttachments.length === 0 &&
            fileAttachments.length === 0
              ? styles.emojiOnly
              : ""
          }`}
        >
          {payload.text}
        </div>
      )}
      {mediaAttachments.length > 0 && (
        <MediaGrid attachments={mediaAttachments} />
      )}
      {fileAttachments.length > 0 && (
        <div className={styles.payloadAttachments}>
          {fileAttachments.map((attachment, index) => (
            <ChatAttachment
              key={`${attachment.url || attachment.name || "file"}-${index}`}
              attachment={attachment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
