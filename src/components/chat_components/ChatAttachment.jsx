import { Component, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";
import styles from "./chatStyles.js";

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const TRAILING_PUNCTUATION = /[)\],.!?]+$/;

const normalizeUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

const parseMessagePayload = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    if (parsed?.kind === "share_post") {
      return {
        kind: "share_post",
        postId: parsed.postId,
        postImage: parsed.postImage || "",
        postTitle: parsed.postTitle || "게시글",
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
  const mimeType = attachment?.mimeType || "";
  return (
    attachment?.resourceType === "image" ||
    attachment?.resourceType === "video" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/")
  );
};

const isVideo = (attachment) =>
  attachment?.resourceType === "video" ||
  String(attachment?.mimeType || "").startsWith("video/");

const getDownloadUrl = (attachment) =>
  attachment?.downloadUrl || getImageUrl(attachment?.url);

const downloadAttachment = (attachment) => {
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

const getLinkPreview = (text) => {
  const url = extractUrls(text)[0];
  if (!url) return null;

  const hostname = getHostname(url);
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return {
      type: "youtube",
      url,
      videoId,
      title: "YouTube 동영상",
      domain: "youtube.com",
    };
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

const renderTextWithLinks = (value) => {
  const text = String(value || "");
  if (!text) return "";

  URL_PATTERN.lastIndex = 0;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_PATTERN.exec(text))) {
    let url = match[0];
    let start = match.index;
    let end = start + url.length;
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] || "";

    if (trailing) {
      url = url.slice(0, -trailing.length);
      end -= trailing.length;
    }

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    const href = normalizeUrl(url);
    nodes.push(
      <a
        key={`${start}-${href}`}
        className={styles.messageLink}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {url}
      </a>,
    );
    if (trailing) nodes.push(trailing);
    lastIndex = end;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length > 0 ? nodes : text;
};

function SharedPostCard({ payload }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={styles.sharedPostCard}
      onClick={() => navigate(`/detail/${payload.postId}`)}
      disabled={!payload.postId}
    >
      {payload.postImage && (
        <div className={styles.sharedPostImageContainer}>
          <img
            src={getImageUrl(payload.postImage)}
            alt=""
            className={styles.sharedPostImage}
          />
        </div>
      )}
      <div className={styles.sharedPostContent}>
        <span className={styles.sharedPostEyebrow}>공유된 게시글</span>
        <strong className={styles.sharedPostTitle}>
          {payload.postTitle || "게시글"}
        </strong>
        <span className={styles.sharedPostMeta}>
          {payload.sharerNickname || "알 수 없음"}님이 공유했습니다.
        </span>
      </div>
    </button>
  );
}

function LinkPreviewCard({ preview }) {
  return (
    <a
      className={styles.linkPreview}
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className={styles.linkPreviewIcon}>
        <span aria-hidden="true">{preview.type === "map" ? "지도" : "링크"}</span>
      </div>
      <div className={styles.linkPreviewMeta}>
        <strong className={styles.linkPreviewTitle}>{preview.title}</strong>
        <span className={styles.linkPreviewUrl}>{preview.domain}</span>
      </div>
    </a>
  );
}

function YouTubePreview({ preview }) {
  const [title, setTitle] = useState("YouTube 동영상");
  const thumbnailUrl = `https://i.ytimg.com/vi/${preview.videoId}/hqdefault.jpg`;

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(preview.url)}&format=json`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setTitle(data.title || "YouTube 동영상");
      } catch {
        // 기본 제목을 유지합니다.
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [preview.url]);

  return (
    <a
      className={styles.youtubePreview}
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className={styles.youtubeThumb}>
        <img src={thumbnailUrl} alt={title} />
        <span className={styles.youtubePlayBadge}>재생</span>
      </div>
      <div className={styles.youtubeMeta}>
        <span className={styles.youtubeDomain}>youtube.com</span>
        <strong className={styles.youtubeTitle}>{title}</strong>
      </div>
    </a>
  );
}

export default function ChatAttachment({ attachment }) {
  const filename = repairFilename(attachment?.name) || "파일 다운로드";
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
          내려받기
        </span>
      </a>
    </div>
  );
}

export function MediaLightbox({ attachments, index, onClose, onMove }) {
  const attachment = attachments[index];
  const src = getImageUrl(attachment?.url);
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
        X
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
            aria-label="이전 이미지"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMove(1)}
            title="다음"
            aria-label="다음 이미지"
          >
            ›
          </button>
        </>
      )}

      <div
        className={styles.lightboxBody}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isVideo(attachment) ? (
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
          const filename = repairFilename(attachment.name) || "미디어 보기";
          const showOverlay = index === visible.length - 1 && overflow > 0;

          return (
            <button
              key={`${attachment.url || attachment.name || "media"}-${index}`}
              type="button"
              className={styles.mediaGridItem}
              onClick={() => setLightboxIndex(index)}
              title={filename}
            >
              {isVideo(attachment) ? (
                <video src={src} muted />
              ) : (
                <img src={src} alt={filename} />
              )}
              {isVideo(attachment) && (
                <span className={styles.videoBadge}>동영상</span>
              )}
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

function ChatMessageContentBody({ content }) {
  const payload = parseMessagePayload(content);

  if (payload?.kind === "share_post") {
    return <SharedPostCard payload={payload} />;
  }

  const textContent = payload ? payload.text : content;
  const linkPreview = getLinkPreview(textContent);

  if (!payload) {
    if (isSingleEmoji(content)) {
      return <span className={styles.emojiOnly}>{String(content || "").trim()}</span>;
    }

    const text = String(content || "");
    const shouldHideLinkText =
      linkPreview && normalizeUrl(text.trim()) === linkPreview.url;

    return (
      <div className={styles.messagePayload}>
        {linkPreview?.type === "youtube" && (
          <YouTubePreview preview={linkPreview} />
        )}
        {linkPreview && linkPreview.type !== "youtube" && (
          <LinkPreviewCard preview={linkPreview} />
        )}
        {!shouldHideLinkText && (
          <div className={styles.payloadText}>{renderTextWithLinks(content)}</div>
        )}
      </div>
    );
  }

  const mediaAttachments = payload.attachments.filter(isMedia);
  const fileAttachments = payload.attachments.filter(
    (attachment) => !isMedia(attachment),
  );
  const shouldHideLinkText =
    linkPreview && normalizeUrl(payload.text.trim()) === linkPreview.url;

  return (
    <div className={styles.messagePayload}>
      {linkPreview?.type === "youtube" && (
        <YouTubePreview preview={linkPreview} />
      )}
      {linkPreview && linkPreview.type !== "youtube" && (
        <LinkPreviewCard preview={linkPreview} />
      )}
      {payload.text && !shouldHideLinkText && (
        <div
          className={`${styles.payloadText} ${
            isSingleEmoji(payload.text) &&
            mediaAttachments.length === 0 &&
            fileAttachments.length === 0
              ? styles.emojiOnly
              : ""
          }`}
        >
          {renderTextWithLinks(payload.text)}
        </div>
      )}
      {mediaAttachments.length > 0 && <MediaGrid attachments={mediaAttachments} />}
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

class ChatMessageContentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Chat message render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.payloadText}>
          {String(this.props.fallbackText || "")}
        </div>
      );
    }

    return this.props.children;
  }
}

export class MessageRowErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Chat message row render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.msgBubble}>
          {String(this.props.fallbackText || "메시지를 표시할 수 없습니다.")}
        </div>
      );
    }

    return this.props.children;
  }
}

export function ChatMessageContent({ content }) {
  return (
    <ChatMessageContentErrorBoundary fallbackText={content}>
      <ChatMessageContentBody content={content} />
    </ChatMessageContentErrorBoundary>
  );
}
