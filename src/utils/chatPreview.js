const parseMessagePayload = (content) => {
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
    if (parsed?.kind === "share_post") {
      const sharer = parsed.sharerNickname || "알 수 없음";
      const title = parsed.postTitle || "게시글";
      return { text: `${sharer}님이 "${title}" 게시글을 공유했습니다.`, attachments: [] };
    }
  } catch {
    return null;
  }

  return null;
};

const getAttachmentLabel = (attachment) => {
  const mimeType = attachment?.mimeType || "";
  if (attachment?.resourceType === "image" || mimeType.startsWith("image/")) {
    return "이미지를 보냈습니다.";
  }
  if (attachment?.resourceType === "video" || mimeType.startsWith("video/")) {
    return "동영상을 보냈습니다.";
  }
  return "파일을 보냈습니다.";
};

export const formatChatPreview = (content) => {
  const payload = parseMessagePayload(content);
  if (!payload) return content || "";

  const text = payload.text.trim();
  if (text) return text;
  if (payload.attachments.length === 0) return "";

  if (payload.attachments.length === 1) {
    return getAttachmentLabel(payload.attachments[0]);
  }

  return `${getAttachmentLabel(payload.attachments[0])} 외 ${payload.attachments.length - 1}개`;
};
