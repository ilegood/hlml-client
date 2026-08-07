import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/instance";
import {
  normalizeUrl,
  TRAILING_PUNCTUATION,
  URL_PATTERN,
} from "./attachmentUtils";

export function SharedPostCard({ payload }) {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(`/detail/${payload.postId}`)} disabled={!payload.postId}>
      {payload.postImage && <img src={getImageUrl(payload.postImage)} alt="" />}
      <strong>{payload.postTitle || "게시물"}</strong>
      <span>{payload.sharerNickname || "알 수 없음"}님이 공유했습니다.</span>
    </button>
  );
}

export function LinkPreviewCard({ preview }) {
  return (
    <a href={preview.url} target="_blank" rel="noreferrer noopener">
      <span aria-hidden="true">{preview.type === "map" ? "지도" : "링크"}</span>
      <strong>{preview.title}</strong>
      <span>{preview.domain}</span>
    </a>
  );
}

export function YouTubePreview({ preview }) {
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
    <a href={preview.url} target="_blank" rel="noreferrer noopener">
      <img src={thumbnailUrl} alt={title} />
      <strong>{title}</strong>
      <span>{preview.url}</span>
    </a>
  );
}

export function renderTextWithLinks(value) {
  const text = String(value || "");
  if (!text) return "";

  URL_PATTERN.lastIndex = 0;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_PATTERN.exec(text))) {
    let url = match[0];
    const start = match.index;
    let end = start + url.length;
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] || "";
    if (trailing) {
      url = url.slice(0, -trailing.length);
      end -= trailing.length;
    }
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    const href = normalizeUrl(url);
    nodes.push(<a key={`${start}-${href}`} href={href} target="_blank" rel="noreferrer noopener">{url}</a>);
    if (trailing) nodes.push(trailing);
    lastIndex = end;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length > 0 ? nodes : text;
}
