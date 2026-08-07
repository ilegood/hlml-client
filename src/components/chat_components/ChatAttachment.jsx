import { useCallback, useEffect, useState } from "react";
import {
  downloadAttachment,
  getDownloadUrl,
  isVideo,
  repairFilename,
} from "./attachmentUtils";
import { getImageUrl } from "../../api/instance";

export default function ChatAttachment({ attachment }) {
  const filename = repairFilename(attachment?.name) || "파일 다운로드";
  const downloadUrl = getDownloadUrl(attachment);

  return (
    <div className="[display:inline-flex] [flex-direction:column] [gap:6px] [max-width:min(420px,_100%)]">
      <a
        className="[display:flex] [align-items:center] [justify-content:space-between] [gap:16px] [width:min(360px,_100%)] [min-height:46px] [padding:10px_12px_10px_14px] [border:1px_solid_var(--color-border)] [border-radius:8px] [background:var(--color-input-bg)] [color:var(--color-text)] [font-size:13px] [font-weight:700] [text-decoration:none] [box-sizing:border-box]"
        href={downloadUrl || "#"}
        download={filename}
        title={filename}
        onClick={(event) => { if (!downloadUrl) event.preventDefault(); }}
      >
        <span className="[min-width:0] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">{filename}</span>
        <span className="[display:inline-flex] [align-items:center] [justify-content:center] [flex:0_0_auto] [width:30px] [height:30px] [border-radius:6px] [background:var(--color-sidebar)]" aria-hidden="true">
          ↓
        </span>
      </a>
    </div>
  );
}

export function MediaLightbox({ attachments, index, onClose, onMove }) {
  const attachment = attachments[index];
  const src = getImageUrl(attachment?.url);
  const filename = repairFilename(attachment?.name) || "미디어 파일";

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
    <div className="[position:fixed] [inset:0] [z-index:6000] [display:flex] [align-items:center] [justify-content:center] [background:rgba(0,_0,_0,_0.86)] [padding:56px] [box-sizing:border-box]" onMouseDown={onClose}>
      <div className="[position:fixed] [top:18px] [right:72px] [display:flex] [gap:8px]" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={() => downloadAttachment(attachment)}>이미지 다운로드</button>
        {attachments.length > 1 && <button type="button" onClick={downloadAll}>모두 다운로드</button>}
      </div>
      {attachments.length > 1 && (
        <>
          <button type="button" onClick={() => onMove(-1)} aria-label="이전 이미지">‹</button>
          <button type="button" onClick={() => onMove(1)} aria-label="다음 이미지">›</button>
        </>
      )}
      <div className="[max-width:min(1100px,_100%)] [max-height:100%] [display:flex] [flex-direction:column] [gap:10px] [align-items:center]" onMouseDown={(event) => event.stopPropagation()}>
        {isVideo(attachment) ? <video src={src} controls autoPlay /> : <img src={src} alt={filename} className="[max-width:100%] [max-height:calc(100vh_-_140px)] [object-fit:contain]" />}
        <div className="[width:100%] [display:flex] [justify-content:space-between] [color:#fff]"><span>{filename}</span><span>{index + 1} / {attachments.length}</span></div>
      </div>
    </div>
  );
}

export function MediaGrid({ attachments }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const visible = attachments.slice(0, 4);
  const overflow = attachments.length - visible.length;
  const moveLightbox = useCallback((delta) => {
    setLightboxIndex((current) => current === null ? current : (current + delta + attachments.length) % attachments.length);
  }, [attachments.length]);

  return (
    <>
      <div className="[display:grid] [grid-template-columns:repeat(2,_minmax(0,_180px))] [grid-auto-rows:132px] [gap:4px] [width:min(364px,_100%)] [overflow:hidden] [border-radius:8px]">
        {visible.map((attachment, index) => {
          const src = getImageUrl(attachment.url);
          const filename = repairFilename(attachment.name) || "미디어 파일 보기";
          const showOverlay = index === visible.length - 1 && overflow > 0;
          return (
            <button key={`${attachment.url || attachment.name || "media"}-${index}`} type="button" onClick={() => setLightboxIndex(index)} title={filename}>
              {isVideo(attachment) ? <video src={src} muted className="[width:100%] [height:100%] [object-fit:cover]" /> : <img src={src} alt={filename} className="[width:100%] [height:100%] [object-fit:cover]" />}
              {showOverlay && <span>+{overflow}</span>}
            </button>
          );
        })}
      </div>
      {lightboxIndex !== null && <MediaLightbox attachments={attachments} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onMove={moveLightbox} />}
    </>
  );
}
