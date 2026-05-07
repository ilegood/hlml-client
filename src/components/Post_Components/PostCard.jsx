/**
 * PostCard — 세 페이지에서 공유하는 카드 컴포넌트
 *
 * variant:
 *   "main"     — 진행률 바 + 찜/댓글 버튼 + 태그/날짜/장소 메타 (MainPage)
 *   "my-posts" — 진행률 바 없이 참여 인원 텍스트 + 좋아요 수만 (MyPostsPage)
 *   "likes"    — 참여 인원 텍스트 + 찜 토글 버튼 (LikesPage)
 */

import {
  STATUS_EMOJI,
  STATUS_CLASS,
  getTimeAgo,
  countComments,
  formatDateTime,
} from "../../api/homeConstants";
import styles from "./PostCard.module.css";

export default function PostCard({
  post,
  variant = "main",
  onLike,
  onOpen,
  currentUserId,
}) {
  if (!post) return null;

  const liked = Array.isArray(post.likedBy)
    ? post.likedBy.includes(currentUserId || "me")
    : false;
  const isAuthor = post.author === currentUserId;
  const participants = post.participants || 0;
  const capacity = post.capacity || 4;
  const pct = Math.min(100, Math.round((participants / capacity) * 100));
  const total = countComments(post.comments || []);

  // main 전용
  const tags = post.categories
    ? Object.entries(post.categories).filter(([, v]) => v)
    : [];
  const ds = formatDateTime(post.date, post.time);

  const isDisabled = isAuthor || !currentUserId || currentUserId === "me";

  const status = post.status === "모집완료" ? "모집완료" : "모집중";
  const badgeClass =
    STATUS_CLASS[status] === "status-full"
      ? styles.statusFull
      : styles.statusOpen;

  return (
    <div className={styles.card} onClick={() => onOpen?.(post.id)}>
      {/* ── Inner ── */}
      <div className={styles.cardInner}>
        <div className={styles.cardImgWrap}>
          {post.image ? (
            <img className={styles.cardImg} src={post.image} alt="" />
          ) : (
            <div className={styles.cardImgEmpty} />
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardHeaderRow}>
            <span className={`${styles.statusBadge} ${badgeClass}`}>
              {STATUS_EMOJI[status]} {status}
            </span>
            {Boolean(post.edited) && (
              <span className={styles.editedBadge}>수정됨</span>
            )}
            <span className={styles.cardTime}>
              {getTimeAgo(post.createdAt)}
            </span>
          </div>

          <div className={styles.cardTitle}>{post.title}</div>
          <div className={styles.cardContent}>{post.content}</div>

          {/* main 전용: 날짜·장소·태그 */}
          {variant === "main" && (
            <>
              {ds && (
                <div className={styles.metaItem}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {ds}
                </div>
              )}
              {post.place && (
                <div className={styles.metaItem}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {post.place}
                </div>
              )}
              {tags.length > 0 && (
                <div className={styles.tagRow}>
                  {tags.map(([, v]) => (
                    <span key={v} className={styles.tag}>
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={styles.cardFooter}>
        {/* main: 진행률 바 */}
        {variant === "main" ? (
          <div className={styles.capProgressWrap}>
            <div className={styles.capText}>
              {participants} / {capacity}명 참여중
            </div>
            <div className={styles.capBar}>
              <div className={styles.capFill} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          /* my-posts / likes: 텍스트만 */
          <span className={styles.participants}>
            {participants} / {capacity}명 참여중
          </span>
        )}

        <div className={styles.footerBtns}>
          {/* 찜 버튼 — main / likes */}
          {(variant === "main" || variant === "likes") && (
            <button
              className={`${styles.actionBtn}${liked ? ` ${styles.liked}` : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(post);
              }}
              disabled={variant === "main" ? isDisabled : false}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={liked ? "#ff4757" : "none"}
                stroke={liked ? "#ff4757" : "currentColor"}
                strokeWidth="2.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {post.likes || 0}
            </button>
          )}

          {/* 댓글 수 — main / my-posts */}
          {variant !== "likes" && (
            <span className={styles.commentCount}>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {total}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
