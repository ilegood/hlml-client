import { Component, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";

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

const removeUrls = (value) =>
  String(value || "")
    .replace(URL_PATTERN, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

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

const createLinkPreview = (url) => {
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

const getLinkPreviews = (text) =>
  extractUrls(text).map(createLinkPreview).filter(Boolean);

const getLinkPreview = (text) => getLinkPreviews(text)[0] || null;

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
        className={"[color:var(--color-active)] [text-decoration:underline] [text-underline-offset:2px] [word-break:break-all]"}
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
      className={"[flex-direction:column] [width:min(500px,_100%)] [min-height:auto] [overflow:hidden] [padding:0] [cursor:pointer] [text-align:left] [gap:0]"}
      onClick={() => navigate(`/detail/${payload.postId}`)}
      disabled={!payload.postId}
    >
      {payload.postImage && (
        <div className={"[width:100%] [aspect-ratio:16_/_9] [overflow:hidden] [background-color:var(--color-border)] [display:flex] [justify-content:center] [align-items:center]"}>
          <img
            src={getImageUrl(payload.postImage)}
            alt=""
            className={"[width:100%] [height:100%] [display:block] [object-fit:cover]"}
          />
        </div>
      )}
      <div className={"[flex:1] [min-width:0] [display:flex] [flex-direction:column] [gap:4px] [padding:12px_14px_13px]"}>
        <span className={"[display:none]"}>공유된 게시글</span>
        <strong className={"[font-size:16px] [line-height:1.35] [color:var(--color-text)] [overflow:hidden] [text-overflow:ellipsis] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [white-space:normal]"}>
          {payload.postTitle || "게시글"}
        </strong>
        <span className={"[font-size:12px] [line-height:1.35] [color:var(--color-deactive)] [overflow:hidden] [text-overflow:ellipsis] [white-space:normal]"}>
          {payload.sharerNickname || "알 수 없음"}님이 공유했습니다.
        </span>
      </div>
    </button>
  );
}

function LinkPreviewCard({ preview }) {
  return (
    <a
      className={"[display:flex] [flex-direction:column] [width:min(500px,_100%)] [margin:5px_0] [overflow:hidden] [border:1px_solid_var(--color-border)] [border-radius:12px] [background:var(--color-input-bg)] [color:#2563eb] [text-decoration:none] [transition:border-color_0.15s,_background_0.15s,_transform_0.15s]"}
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
    >
      <div className={"[display:flex] [flex-direction:column] [gap:4px] [padding:14px]"}>
        <strong className={"[font-size:14px] [line-height:1.4] [font-weight:800] [color:#2563eb] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]"}>
          {preview.url}
        </strong>
        <span className={"[font-size:11px] [color:#2563eb] [opacity:0.8] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]"}>
          {preview.domain}
        </span>
      </div>
    </a>
  );
}

function LinkList({ previews }) {
  return (
    <div className={"[display:flex] [flex-direction:column] [gap:8px] [width:min(500px,_100%)]"}>
      {previews.map((preview) => (
        <a
          key={preview.url}
          className={"[display:flex] [min-width:0] [align-items:center] [gap:10px] [padding:10px_12px] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-input-bg)] [color:#2563eb] [text-decoration:none] [transition:background_0.15s,_border-color_0.15s]"}
          href={preview.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className={"[min-width:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [font-size:13px] [font-weight:700] [color:#2563eb]"}>
            {preview.url}
          </span>
        </a>
      ))}
    </div>
  );
}

function YouTubePreview({ preview }) {
  const [title, setTitle] = useState("YouTube video");
  const thumbnailUrl = `https://i.ytimg.com/vi/${preview.videoId}/hqdefault.jpg`;

  useEffect(() => {
    let cancelled = false;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(preview.url)}&format=json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (!cancelled && data?.title) setTitle(data.title); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [preview.url]);

  return (
    <a className="[display:flex] [flex-direction:column] [width:min(500px,_100%)] [margin:5px_0] [overflow:hidden] [border:1px_solid_var(--color-border)] [border-radius:12px] [background:var(--color-input-bg)] [color:var(--color-text)] [text-decoration:none]" href={preview.url} target="_blank" rel="noreferrer noopener">
      <div className="[width:100%] [aspect-ratio:16/9] [overflow:hidden] [background:var(--color-border)]">
        <img src={thumbnailUrl} alt={title} className="[width:100%] [height:100%] [object-fit:cover] [display:block]" />
      </div>
      <div className="[display:flex] [flex-direction:column] [gap:4px] [padding:12px_14px_14px]">
        <strong className="[font-size:15px] [line-height:1.4] [font-weight:800] [color:var(--color-text)] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [overflow:hidden]">{title}</strong>
        <span className="[font-size:11px] [color:var(--color-deactive)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{preview.url}</span>
      </div>
    </a>
  );
}

export default function ChatAttachment({ attachment }) {
  const filename = repairFilename(attachment?.name) || "파일 다운로드";
  const downloadUrl = getDownloadUrl(attachment);

  return (
    <div className={"[display:inline-flex] [flex-direction:column] [gap:6px] [max-width:min(420px,_100%)]"}>
      <a
        className={"[display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [width:min(360px,_100%)] [min-height:46px] [padding:10px_12px_10px_14px] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-input-bg)] [color:var(--color-text)] [font-size:13px] [font-weight:700] [text-decoration:none] [box-sizing:border-box] [transition:border-color_0.15s,_background_0.15s,_color_0.15s]"}
        href={downloadUrl || "#"}
        download={filename}
        title={filename}
        onClick={(event) => {
          if (!downloadUrl) event.preventDefault();
        }}
      >
        <span className={"[min-width:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]"}>{filename}</span>
        <span className={"[display:inline-flex] [align-items:center] [justify-content:center] [flex:0_0_auto] [width:30px] [height:30px] [border-radius:6px] [background:var(--color-sidebar)] [color:currentColor]"} aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
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
    <div className={"[position:fixed] [inset:0] [z-index:6000] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.86)] [padding:56px] [box-sizing:border-box]"} onMouseDown={onClose}>
      <div className="[position:fixed] [top:18px] [right:72px] [display:flex] [gap:8px] [z-index:1]" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="[height:40px] [padding:0_14px] [border:none] [border-radius:8px] [background:rgba(255,_255,_255,_0.12)] [color:#fff] [font:inherit] [font-size:13px] [font-weight:800] [cursor:pointer] hover:[background:rgba(255,_255,_255,_0.22)]" onClick={() => downloadAttachment(attachment)}>{"\uC774\uBBF8\uC9C0 \uB2E4\uC6B4\uB85C\uB4DC"}</button>
        {attachments.length > 1 && <button type="button" className="[height:40px] [padding:0_14px] [border:none] [border-radius:8px] [background:rgba(255,_255,_255,_0.12)] [color:#fff] [font:inherit] [font-size:13px] [font-weight:800] [cursor:pointer] hover:[background:rgba(255,_255,_255,_0.22)]" onClick={downloadAll}>{"\uBAA8\uB450 \uB2E4\uC6B4\uB85C\uB4DC"}</button>}
      </div>

      {attachments.length > 1 && (
        <>
          <button
            type="button"
            className={`${"[position:fixed] [z-index:2] [top:50%] [width:44px] [height:64px] [border:none] [border-radius:8px] [background:rgba(255,_255,_255,_0.12)] [color:#fff] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [font-size:48px] [transform:translateY(-50%)]"} ${"[left:20px]"} hover:[background:rgba(255,_255,_255,_0.22)]`}
            style={{ top: "50%", transform: "translateY(-50%)" }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMove(-1)}
            title="이전"
            aria-label="이전 이미지"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${"[position:fixed] [z-index:2] [top:50%] [width:44px] [height:64px] [border:none] [border-radius:8px] [background:rgba(255,_255,_255,_0.12)] [color:#fff] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [font-size:48px] [transform:translateY(-50%)]"} ${"[right:20px]"} hover:[background:rgba(255,_255,_255,_0.22)]`}
            style={{ top: "50%", transform: "translateY(-50%)" }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onMove(1)}
            title="다음"
            aria-label="다음 이미지"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        className={"[max-width:min(1100px,_100%)] [max-height:100%] [display:flex] [flex-direction:column] [gap:10px] [align-items:center]"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isVideo(attachment) ? (
          <video src={src} controls autoPlay />
        ) : (
          <img src={src} alt={filename} className="[max-width:100%] [max-height:calc(100vh_-_140px)] [width:auto] [height:auto] [object-fit:contain] [display:block]" />
        )}
        <div className={"[width:100%] [display:flex] [justify-content:space-between] [gap:16px] [color:#fff] [font-size:13px] [font-weight:700]"}>
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
        className={`${"[display:grid] [grid-template-columns:repeat(2,_minmax(0,_180px))] [grid-auto-rows:132px] [gap:4px] [width:min(364px,_100%)] [overflow:hidden] [border-radius:8px]"} ${
          attachments.length === 1 ? "[display:block] [width:min(420px,_100%)]" : ""
        } ${attachments.length === 2 ? "[grid-template-columns:repeat(2,_minmax(0,_180px))] [grid-auto-rows:180px]" : ""} ${
          attachments.length === 3 ? "" : ""
        }`}
        style={
          attachments.length === 1
            ? { display: "block", width: "min(420px, 100%)", overflow: "visible" }
            : undefined
        }
      >
        {visible.map((attachment, index) => {
          const src = getImageUrl(attachment.url);
          const filename = repairFilename(attachment.name) || "미디어 보기";
          const showOverlay = index === visible.length - 1 && overflow > 0;

          return (
            <button
              key={`${attachment.url || attachment.name || "media"}-${index}`}
              type="button"
              className={"[position:relative] [display:block] [min-width:0] [min-height:0] [overflow:hidden] [color:#fff] [background:transparent] [border:none] [padding:0] [cursor:pointer] [background:none]"}
              style={
                attachments.length === 1
                  ? { width: "min(420px, 100%)", height: "auto" }
                  : attachments.length === 3 && index === 0
                    ? { gridRow: "span 2" }
                    : undefined
              }
              onClick={() => setLightboxIndex(index)}
              title={filename}
            >
              {isVideo(attachment) ? (
                <video src={src} muted className="[width:100%] [height:100%] [object-fit:cover] [display:block]" />
              ) : (
                <img
                  src={src}
                  alt={filename}
                  style={
                    attachments.length === 1
                      ? { width: "100%", height: "auto", objectFit: "contain", display: "block" }
                      : undefined
                  }
                  className={
                    attachments.length === 1
                      ? "[width:100%] [height:auto] [object-fit:contain] [display:block]"
                      : "[width:100%] [height:100%] [object-fit:cover] [display:block]"
                  }
                />
              )}
              {isVideo(attachment) && (
                <span className={"[position:absolute] [left:8px] [bottom:8px] [padding:3px_7px] [border-radius:4px] [background:rgba(0,_0,_0,_0.68)] [color:#fff] [font-size:11px] [font-weight:700]"}>동영상</span>
              )}
              {showOverlay && (
                <span className={"[position:absolute] [inset:0] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.55)] [font-size:26px] [font-weight:800]"}>+{overflow}</span>
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
  const linkPreviews = getLinkPreviews(textContent);
  const linkPreview = linkPreviews.length === 1 ? linkPreviews[0] : null;
  const visibleText = linkPreviews.length > 0 ? removeUrls(textContent) : textContent;

  if (!payload) {
    if (isSingleEmoji(content)) {
      return <span className={"[display:inline-block] [font-size:42px] [line-height:1.15] [white-space:normal]"}>{String(content || "").trim()}</span>;
    }

    const text = String(content || "");

    return (
      <div className={"[display:flex] [flex-direction:column] [gap:8px]"}>
        {linkPreviews.length > 1 && <LinkList previews={linkPreviews} />}
        {linkPreview?.type === "youtube" && (
          <YouTubePreview preview={linkPreview} />
        )}
        {linkPreview && linkPreview.type !== "youtube" && (
          <LinkPreviewCard preview={linkPreview} />
        )}
        {visibleText && (
          <div className={"[white-space:pre-wrap]"}>
            {linkPreview ? visibleText : renderTextWithLinks(text)}
          </div>
        )}
      </div>
    );
  }

  const mediaAttachments = payload.attachments.filter(isMedia);
  const fileAttachments = payload.attachments.filter(
    (attachment) => !isMedia(attachment),
  );

  return (
    <div className={"[display:flex] [flex-direction:column] [gap:8px]"}>
      {linkPreviews.length > 1 && <LinkList previews={linkPreviews} />}
      {linkPreview?.type === "youtube" && (
        <YouTubePreview preview={linkPreview} />
      )}
      {linkPreview && linkPreview.type !== "youtube" && (
        <LinkPreviewCard preview={linkPreview} />
      )}
      {visibleText && (
        <div
          className={`${"[white-space:pre-wrap]"} ${
            isSingleEmoji(payload.text) &&
            mediaAttachments.length === 0 &&
            fileAttachments.length === 0
              ? "[display:inline-block] [font-size:42px] [line-height:1.15] [white-space:normal]"
              : ""
          }`}
        >
          {linkPreview ? visibleText : renderTextWithLinks(payload.text)}
        </div>
      )}
      {mediaAttachments.length > 0 && <MediaGrid attachments={mediaAttachments} />}
      {fileAttachments.length > 0 && (
        <div className={"[display:flex] [flex-direction:column] [gap:10px]"}>
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
        <div className={"[white-space:pre-wrap]"}>
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
        <div className={"[font-size:15px] [line-height:1.5] [word-break:break-word] [color:var(--color-text)] [white-space:pre-wrap]"}>
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
