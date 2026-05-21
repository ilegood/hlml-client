import { Component, useCallback, useEffect, useState } from "react";
import instance, { getImageUrl } from "../../api/instance";
import styles from "../../pages/chat_pages/ChatRoomDetail.module.css";

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const MARKDOWN_LINK_PATTERN = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|www\.[^\s)]+)\)/gi;
const TRAILING_PUNCTUATION = /[)\],.!?…]+$/;

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

const normalizeUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

const getHostname = (value) => {
  try {
    return new URL(normalizeUrl(value)).hostname.toLowerCase();
  } catch {
    return "";
  }
};

const stripCodeBlocks = (value) =>
  String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ");

const extractUrls = (text) => {
  const raw = stripCodeBlocks(text);
  URL_PATTERN.lastIndex = 0;
  const urls = [];
  const seen = new Set();
  let match;

  while ((match = URL_PATTERN.exec(raw))) {
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

const getYouTubeVideoId = (value) => {
  try {
    const url = new URL(normalizeUrl(value));
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      return /^[\w-]{6,}$/.test(videoId) ? videoId : "";
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v") || "";
      const pathParts = url.pathname.split("/").filter(Boolean);
      const videoIndex = pathParts.findIndex((part) =>
        ["shorts", "embed", "live"].includes(part),
      );
      if (videoIndex !== -1) return pathParts[videoIndex + 1] || "";
    }
  } catch {
    return "";
  }

  return "";
};

const getYouTubePreview = (text) => {
  const url = extractUrls(text)[0];
  if (!url) return null;

  const hostname = getHostname(url);
  if (
    ![
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "youtu.be",
    ].includes(hostname)
  ) {
    return null;
  }

  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  return {
    url,
    videoId,
  };
};

const getLinkPreview = (text) => {
  const youtubePreview = getYouTubePreview(text);
  if (youtubePreview) {
    return {
      type: "youtube",
      ...youtubePreview,
    };
  }

  const url = extractUrls(text)[0];
  if (!url) return null;

  const hostname = getHostname(url);
  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return "";
    }
  })();

  const isMap =
    hostname === "naver.me" ||
    hostname === "map.naver.com" ||
    hostname.endsWith(".map.naver.com") ||
    hostname === "map.kakao.com" ||
    hostname.endsWith(".map.kakao.com") ||
    hostname === "place.map.kakao.com" ||
    hostname === "m.map.kakao.com" ||
    hostname === "maps.google.com" ||
    hostname === "maps.app.goo.gl" ||
    (hostname === "goo.gl" && path.startsWith("/maps")) ||
    (hostname.endsWith("google.com") && path.startsWith("/maps")) ||
    (hostname.endsWith("google.co.kr") && path.startsWith("/maps"));

  if (isMap) {
    return {
      type: "map",
      url,
      domain: hostname,
      title: "네이버 지도",
    };
  }

  if (hostname === "blog.naver.com" || hostname === "m.blog.naver.com") {
    return {
      type: "blog",
      url,
      domain: "blog.naver.com",
      title: "네이버 블로그",
    };
  }

  if (hostname === "cafe.naver.com" || hostname === "m.cafe.naver.com") {
    return {
      type: "cafe",
      url,
      domain: "cafe.naver.com",
      title: "네이버 카페",
    };
  }

  if (hostname === "search.naver.com") {
    return {
      type: "link",
      url,
      domain: hostname,
      title: "네이버 검색",
    };
  }

  return {
    type: "link",
    url,
    domain: hostname,
    title: hostname,
  };
};
const renderPlainTextWithLinks = (value, keyPrefix = "plain") => {
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

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const href = url.startsWith("http") ? url : `https://${url}`;
    nodes.push(
      <a
        key={`${keyPrefix}-${start}-${url}`}
        className={styles.messageLink}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {url}
      </a>,
    );

    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
};

const renderTextWithLinks = (value) => {
  const text = String(value || "");
  if (!text) return "";

  MARKDOWN_LINK_PATTERN.lastIndex = 0;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = MARKDOWN_LINK_PATTERN.exec(text))) {
    const [fullMatch, label, rawUrl] = match;
    const start = match.index;
    const end = start + fullMatch.length;

    if (start > lastIndex) {
      nodes.push(
        ...[].concat(
          renderPlainTextWithLinks(text.slice(lastIndex, start), `before-${start}`),
        ),
      );
    }

    const href = normalizeUrl(rawUrl);
    nodes.push(
      <a
        key={`markdown-${start}-${href}`}
        className={styles.messageLink}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {label}
      </a>,
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    nodes.push(
      ...[].concat(
        renderPlainTextWithLinks(text.slice(lastIndex), `after-${lastIndex}`),
      ),
    );
  }

  return nodes.length > 0 ? nodes : renderPlainTextWithLinks(text);
};

function YouTubePreview({ url, videoId }) {
  const [title, setTitle] = useState("YouTube 동영상");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  );

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      try {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;

        setTitle(data.title || "YouTube 동영상");
        if (data.thumbnail_url) {
          setThumbnailUrl(data.thumbnail_url);
        }
      } catch {
        // Fallback preview stays in place.
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <a
      className={styles.youtubePreview}
      href={url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className={styles.youtubeThumb}>
        <img src={thumbnailUrl} alt={title} />
        <span className={styles.youtubePlayBadge}>▶</span>
      </div>
      <div className={styles.youtubeMeta}>
        <span className={styles.youtubeDomain}>youtube.com</span>
        <strong className={styles.youtubeTitle}>{title}</strong>
      </div>
    </a>
  );
}

function LinkPreviewCard({ preview }) {
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      setIsLoading(true);
      try {
        const { data } = await instance.get(
          `/chat/link-preview?url=${encodeURIComponent(preview.url)}`,
        );
        if (!cancelled) setMeta(data || null);
      } catch {
        if (!cancelled) setMeta(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [preview.url]);

  const displayUrl = meta?.url || preview.url;
  const displayDomain = (() => {
    try {
      return new URL(displayUrl).hostname.toLowerCase();
    } catch {
      return preview.domain || "";
    }
  })();
  const isNaverType = preview.type === "map" || preview.type === "blog" || preview.type === "cafe";
  const mapServiceName = (() => {
    if (displayDomain.includes("kakao")) return "카카오맵";
    if (displayDomain.includes("google")) return "Google Maps";
    if (displayDomain === "naver.me" || displayDomain.includes("map.naver")) return "네이버 지도";
    return "지도";
  })();
  const title = (() => {
    if (preview.type === "blog") return "네이버 블로그";
    if (preview.type === "cafe") return "네이버 카페";
    if (preview.type === "map") {
      const metaTitle = String(meta?.title || "").trim();
      const weakMapTitle =
        !metaTitle ||
        /^(place|map|지도|naver\s*map|kakao\s*map|google\s*maps)$/i.test(metaTitle);
      return weakMapTitle ? mapServiceName : metaTitle;
    }
    return meta?.title || preview.title || displayUrl;
  })();
  const subtitle = isNaverType ? "" : meta?.subtitle || meta?.description || "";
  const siteLabel = displayDomain;

  return (
    <a
      className={styles.linkPreview}
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
    >
      {isLoading ? (
        <div className={styles.linkPreviewThumbSkeleton} />
      ) : meta?.image ? (
        <div className={styles.linkPreviewThumb}>
          <img src={meta.image} alt="" />
        </div>
      ) : (
        <div className={styles.linkPreviewIcon}>
          <span aria-hidden="true">N</span>
        </div>
      )}
      <div className={styles.linkPreviewMeta}>
        <strong className={styles.linkPreviewTitle}>
          {isLoading ? preview.title : title}
        </strong>
        {subtitle && subtitle !== title && (
          <span className={styles.linkPreviewSubtitle}>{subtitle}</span>
        )}
        <span className={styles.linkPreviewUrl}>{siteLabel}</span>
      </div>
    </a>
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

function ChatMessageContentBody({ content }) {
  const payload = parseMessagePayload(content);
  const linkPreview = getLinkPreview(payload ? payload.text : content);

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
          <YouTubePreview
            url={linkPreview.url}
            videoId={linkPreview.videoId}
          />
        )}
        {linkPreview && linkPreview.type !== "youtube" && (
          <LinkPreviewCard preview={linkPreview} />
        )}
        {!shouldHideLinkText && (
          <div className={styles.payloadText}>
            {renderTextWithLinks(content)}
          </div>
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
        <YouTubePreview
          url={linkPreview.url}
          videoId={linkPreview.videoId}
        />
      )}
      {linkPreview && linkPreview.type !== "youtube" && (
        <LinkPreviewCard preview={linkPreview} />
      )}
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
          {!shouldHideLinkText && renderTextWithLinks(payload.text)}
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

export function ChatMessageContent({ content }) {
  return (
    <ChatMessageContentErrorBoundary fallbackText={content}>
      <ChatMessageContentBody content={content} />
    </ChatMessageContentErrorBoundary>
  );
}
