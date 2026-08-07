import { Component } from "react";
import {
  getLinkPreview,
  isMedia,
  isSingleEmoji,
  normalizeUrl,
  parseMessagePayload,
} from "./attachmentUtils";
import ChatAttachment, { MediaGrid } from "./ChatAttachment";
import {
  LinkPreviewCard,
  renderTextWithLinks,
  SharedPostCard,
  YouTubePreview,
} from "./LinkPreview";

function ChatMessageContentBody({ content }) {
  const payload = parseMessagePayload(content);

  if (payload?.kind === "share_post") {
    return <SharedPostCard payload={payload} />;
  }

  const textContent = payload ? payload.text : content;
  const linkPreview = getLinkPreview(textContent);
  const text = String(textContent || "");
  const shouldHideLinkText =
    linkPreview && normalizeUrl(text.trim()) === linkPreview.url;

  if (!payload) {
    if (isSingleEmoji(content)) {
      return <span className="[display:inline-block] [font-size:42px] [line-height:1.15]">{String(content || "").trim()}</span>;
    }
    return (
      <div className="[display:flex] [flex-direction:column] [gap:8px]">
        {linkPreview?.type === "youtube" && <YouTubePreview preview={linkPreview} />}
        {linkPreview && linkPreview.type !== "youtube" && <LinkPreviewCard preview={linkPreview} />}
        {!shouldHideLinkText && <div className="[white-space:pre-wrap]">{renderTextWithLinks(content)}</div>}
      </div>
    );
  }

  const mediaAttachments = payload.attachments.filter(isMedia);
  const fileAttachments = payload.attachments.filter((attachment) => !isMedia(attachment));

  return (
    <div className="[display:flex] [flex-direction:column] [gap:8px]">
      {linkPreview?.type === "youtube" && <YouTubePreview preview={linkPreview} />}
      {linkPreview && linkPreview.type !== "youtube" && <LinkPreviewCard preview={linkPreview} />}
      {payload.text && !shouldHideLinkText && (
        <div className={isSingleEmoji(payload.text) && mediaAttachments.length === 0 && fileAttachments.length === 0 ? "[font-size:42px]" : "[white-space:pre-wrap]"}>
          {renderTextWithLinks(payload.text)}
        </div>
      )}
      {mediaAttachments.length > 0 && <MediaGrid attachments={mediaAttachments} />}
      {fileAttachments.length > 0 && (
        <div className="[display:flex] [flex-direction:column] [gap:10px]">
          {fileAttachments.map((attachment, index) => (
            <ChatAttachment key={`${attachment.url || attachment.name || "file"}-${index}`} attachment={attachment} />
          ))}
        </div>
      )}
    </div>
  );
}

class ChatMessageContentErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Chat message render failed:", error);
  }

  render() {
    return this.state.hasError
      ? <div className="[white-space:pre-wrap]">{String(this.props.fallbackText || "")}</div>
      : this.props.children;
  }
}

export class MessageRowErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Chat message row render failed:", error);
  }

  render() {
    return this.state.hasError
      ? <div className="[font-size:15px] [line-height:1.5] [word-break:break-word] [color:var(--color-text)] [white-space:pre-wrap]">{String(this.props.fallbackText || "메시지를 표시할 수 없습니다.")}</div>
      : this.props.children;
  }
}

export function ChatMessageContent({ content }) {
  return (
    <ChatMessageContentErrorBoundary fallbackText={content}>
      <ChatMessageContentBody content={content} />
    </ChatMessageContentErrorBoundary>
  );
}
