import { getImageUrl } from "../../api/instance";

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const TRAILING_PUNCTUATION = /[)\],.!?]+$/;

export const normalizeUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

export const parseMessagePayload = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.kind === "share_post") {
      return {
        kind: "share_post",
        postId: parsed.postId,
        postImage: parsed.postImage || "",
        postTitle: parsed.postTitle || "게시물",
        sharerNickname: parsed.sharerNickname || "알 수 없음",
      };
    }
    if (parsed?.kind === "chat_payload") {
      return {
        kind: "chat_payload",
        text: parsed.text || "",
        attachments: Array.isArray(parsed.attachments)
          ? parsed.attachments.filter(Boolean)
          : [],
      };
    }
    if (parsed?.kind === "chat_attachment") {
      return { kind: "chat_payload", text: "", attachments: [parsed] };
    }
  } catch {
    return null;
  }

  return null;
};

const countHangul = (value) =>
  (String(value).match(/[\uAC00-\uD7A3]/g) || []).length;

export const repairFilename = (name) => {
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

export const isMedia = (attachment) => {
  const mimeType = attachment?.mimeType || "";
  return (
    attachment?.resourceType === "image" ||
    attachment?.resourceType === "video" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/")
  );
};

export const isVideo = (attachment) =>
  attachment?.resourceType === "video" ||
  String(attachment?.mimeType || "").startsWith("video/");

export const getDownloadUrl = (attachment) =>
  attachment?.downloadUrl || getImageUrl(attachment?.url);

export const downloadAttachment = (attachment) => {
  const href = getDownloadUrl(attachment);
  if (!href) return;

  const link = document.createElement("a");
  link.href = href;
  link.download = repairFilename(attachment.name) || "다운로드";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const isSingleEmoji = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;
  const parts = Array.from(text);
  return (
    parts.length <= 2 &&
    /\p{Extended_Pictographic}/u.test(text) &&
    !/[0-9A-Za-z\uAC00-\uD7A3]/u.test(text)
  );
};

const extractUrls = (text) => {
  URL_PATTERN.lastIndex = 0;
  const urls = [];
  const seen = new Set();
  let match;

  while ((match = URL_PATTERN.exec(String(text || "")))) {
    let url = match[0];
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] || "";
    if (trailing) url = url.slice(0, -trailing.length);
    const normalized = normalizeUrl(url);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      urls.push(normalized);
    }
  }

  return urls;
};

const getHostname = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.toLowerCase();
  } catch {
    return "";
  }
};

const getYouTubeVideoId = (value) => {
  try {
    const url = new URL(normalizeUrl(value));
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v") || "";
      const parts = url.pathname.split("/").filter(Boolean);
      const index = parts.findIndex((part) =>
        ["shorts", "embed", "live"].includes(part),
      );
      return index >= 0 ? parts[index + 1] || "" : "";
    }
  } catch {
    return "";
  }
  return "";
};

export const getLinkPreview = (text) => {
  const url = extractUrls(text)[0];
  if (!url) return null;

  const hostname = getHostname(url);
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return { type: "youtube", url, videoId, title: "YouTube 동영상", domain: "youtube.com" };
  }

  const isMap =
    hostname === "naver.me" ||
    hostname.includes("map.naver") ||
    hostname.includes("kakao") ||
    hostname.includes("google");

  return {
    type: isMap ? "map" : "link",
    url,
    title: isMap ? "지도" : hostname || url,
    domain: hostname,
  };
};

export { URL_PATTERN, TRAILING_PUNCTUATION };
