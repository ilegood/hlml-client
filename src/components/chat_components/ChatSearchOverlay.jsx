import { useState, useEffect, useRef, useCallback } from "react";
import { searchMessages } from "../../api/chat";
import { getImageUrl } from "../../api/instance";
import styles from "./ChatSearchOverlay.module.css";

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "어제";
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

function highlightText(text, query) {
  if (!query?.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className={styles.resultHighlight}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function ChatSearchOverlay({
  roomKey,
  onSelectMessage,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(
    async (q) => {
      if (!q.trim() || !roomKey) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchMessages(roomKey, q.trim());
        setResults(data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [roomKey],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const handleSelect = (msg) => {
    onSelectMessage?.(msg.id);
    onClose?.();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="대화 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "Enter") doSearch(query);
          }}
        />
        <button className={styles.closeBtn} onClick={onClose} title="닫기">
          ✕
        </button>
      </div>

      <ul className={styles.results}>
        {loading && (
          <li className={styles.spinner}>검색 중...</li>
        )}
        {!loading && searched && results.length === 0 && (
          <li className={styles.emptyState}>검색 결과가 없습니다.</li>
        )}
        {!loading &&
          results.map((msg) => (
            <li
              key={msg.id}
              className={styles.resultItem}
              onClick={() => handleSelect(msg)}
            >
              {msg.profileImg ? (
                <img
                  className={styles.resultAvatar}
                  src={getImageUrl(msg.profileImg)}
                  alt=""
                />
              ) : (
                <div className={styles.resultAvatarFallback}>
                  {(msg.nickname || "?").slice(0, 2)}
                </div>
              )}
              <div className={styles.resultBody}>
                <div className={styles.resultMeta}>
                  <span className={styles.resultNickname}>
                    {msg.nickname || "알 수 없음"}
                  </span>
                  <span className={styles.resultTime}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div className={styles.resultContent}>
                  {highlightText(msg.content, query)}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
