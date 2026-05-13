import { getImageUrl } from "../../api/instance";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";

export const parseAttachment = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    return parsed?.kind === "chat_attachment" ? parsed : null;
  } catch {
    return null;
  }
};

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

export default function ChatAttachment({ attachment }) {
  const src = getImageUrl(attachment.url);
  const isVideo = attachment.mimeType?.startsWith("video/");

  return (
    <div className={styles.attachmentWrap}>
      {isVideo ? (
        <video className={styles.attachmentVideo} src={src} controls />
      ) : (
        <img
          className={styles.attachmentImage}
          src={src}
          alt={attachment.name || "attachment"}
        />
      )}
      {attachment.name && (
        <div className={styles.attachmentName}>{attachment.name}</div>
      )}
    </div>
  );
}

export function ChatMessageContent({ content }) {
  const payload = parseMessagePayload(content);
  if (!payload) return content;

  return (
    <div className={styles.messagePayload}>
      {payload.text && <div className={styles.payloadText}>{payload.text}</div>}
      {payload.attachments.length > 0 && (
        <div className={styles.payloadAttachments}>
          {payload.attachments.map((attachment, index) => (
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
