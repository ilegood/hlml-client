import { useCallback, useState } from "react";
import { getImageUrl } from "../../api/instance";
import { MediaLightbox } from "./ChatAttachment";
import styles from "./chatStyles.js";

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
      <div className={styles.fileGalleryOverlay} onMouseDown={onClose}>
        <section
          className={styles.fileGalleryPanel}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={styles.fileGalleryHeader}>
            <div>
              <h3>파일 모아보기</h3>
              <span>{attachments.length}개 공유됨</span>
            </div>
            <button type="button" onClick={onClose} aria-label="닫기">
              &times;
            </button>
          </div>

          {attachments.length === 0 ? (
            <div className={styles.fileGalleryEmpty}>
              아직 공유된 파일이 없습니다.
            </div>
          ) : (
            <div className={styles.fileGalleryBody}>
              {media.length > 0 && (
                <div className={styles.fileGallerySection}>
                  <div className={styles.fileGallerySectionTitle}>이미지/동영상</div>
                  <div className={styles.fileGalleryMediaGrid}>
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
                          className={styles.fileGalleryMediaItem}
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
                <div className={styles.fileGallerySection}>
                  <div className={styles.fileGallerySectionTitle}>파일</div>
                  <div className={styles.fileGalleryFileList}>
                    {files.map((attachment) => {
                      const filename = repairFilename(attachment.name) || "파일";
                      return (
                        <a
                          key={attachment.id}
                          className={styles.fileGalleryFileItem}
                          href={getDownloadUrl(attachment) || "#"}
                          download={filename}
                          title={filename}
                        >
                          <span className={styles.fileGalleryFileIcon}>FILE</span>
                          <span className={styles.fileGalleryFileInfo}>
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
