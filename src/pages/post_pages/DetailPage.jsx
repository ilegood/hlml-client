import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import {
  STATUS_CLOSED,
  STATUS_EMOJI,
  STATUS_CLASS,
  countComments,
  formatDateTime,
  normalizeStatus,
} from "../../api/homeConstants";
import {
  createComment,
  deleteComment as deletePostComment,
  deletePost,
  getPost,
  togglePostJoin,
  togglePostLike,
  updateComment as updatePostComment,
} from "../../api/posts";
import { CommentItem } from "../../components/post_components/CommentItem";
import MapPreview from "../../components/post_components/MapPreview";
import ReportModal from "../../components/modals/ReportModal";
import styles from "./DetailPage.module.css";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, token } = useAuth();
  const [post, setPost] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetComment, setTargetComment] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setPost(await getPost(id));
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    };
    load();
  }, [id]);

  if (!post) {
    return (
      <main className={styles.container}>
        <div className={styles.notFound}>게시글을 찾을 수 없습니다.</div>
      </main>
    );
  }

  const currentUserId = userId || "";
  const isAuthor = String(post.user_id) === String(currentUserId);
  const liked = (post.likedBy || []).includes(String(currentUserId));
  const joined =
    isAuthor || (post.joinedUserIds || []).includes(String(currentUserId));
  const status = normalizeStatus(post.status);
  const isClosed = status === STATUS_CLOSED;
  const isFull = (post.participants || 0) >= (post.capacity || 4);
  const pct = Math.min(
    100,
    ((post.participants || 0) / (post.capacity || 4)) * 100,
  );
  const tags = Object.entries(post.categories || {}).filter(([, value]) => value);
  const dateStr = formatDateTime(post.date, post.time);
  const totalComments = countComments(post.comments || []);

  const statusBadgeClass =
    STATUS_CLASS[status] === "status-full"
      ? styles.statusFull
      : styles.statusOpen;

  const refreshPost = async () => {
    setPost(await getPost(id));
  };

  const runPostAction = async (action, errorMessage = "처리에 실패했습니다.") => {
    try {
      const next = await action();
      if (next) setPost(next);
    } catch (err) {
      console.error("Failed to sync post:", err);
      toast.error(err.response?.data?.message || errorMessage);
    }
  };

  const toggleLike = () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    const previous = post;
    const currentUserIdString = String(currentUserId);
    setPost({
      ...post,
      likes: Math.max(0, (post.likes || 0) + (liked ? -1 : 1)),
      likedBy: liked
        ? (post.likedBy || []).filter(
            (likedUserId) => String(likedUserId) !== currentUserIdString,
          )
        : [...(post.likedBy || []), currentUserIdString],
    });

    runPostAction(async () => {
      try {
        return await togglePostLike(id);
      } catch (error) {
        setPost(previous);
        throw error;
      }
    }, "찜 처리에 실패했습니다.");
  };

  const handleJoinBtn = async () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    if (joined) {
      navigate(`/chat-rooms/${id}`);
      return;
    }

    try {
      const next = await togglePostJoin(id);
      if (next) setPost(next);
      navigate(`/chat-rooms/${id}`);
    } catch (err) {
      console.error("Failed to join post:", err);
      toast.error(err.response?.data?.message || "참여 처리에 실패했습니다.");
    }
  };

  const addComment = () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;
    runPostAction(() => createComment(id, { content: commentText.trim() }));
    setCommentText("");
  };

  const deleteComment = (idx, replyIdx = null) => {
    toast("정말 삭제할까요?", {
      position: "bottom-center",
      action: {
        label: "삭제",
        onClick: async () => {
          const target =
            replyIdx !== null
              ? post.comments?.[idx]?.replies?.[replyIdx]
              : post.comments?.[idx];

          if (!target?.id) {
            toast.error("삭제할 댓글을 찾을 수 없습니다.");
            return;
          }

          try {
            await deletePostComment(target.id);
            await refreshPost();
            toast.success("삭제했습니다.", { position: "bottom-center" });
          } catch (err) {
            console.error("Failed to delete comment:", err);
            toast.error("삭제에 실패했습니다.", { position: "bottom-center" });
          }
        },
      },
    });
  };

  const updateComment = (
    idx,
    replyText,
    editText,
    replyIdx = null,
    replyEditText = null,
  ) => {
    const comment = post.comments?.[idx];
    if (!comment) return;

    const action = async () => {
      if (editText) {
        await updatePostComment(comment.id, editText);
        await refreshPost();
        return null;
      }

      if (replyText) {
        return createComment(id, {
          content: replyText,
          parent_id: comment.id,
        });
      }

      if (replyEditText !== null && replyIdx !== null) {
        const reply = comment.replies?.[replyIdx];
        if (!reply?.id) return null;
        await updatePostComment(reply.id, replyEditText);
        await refreshPost();
      }

      return null;
    };

    runPostAction(action, "댓글 저장에 실패했습니다.");
  };

  const handleDelete = () => {
    toast("게시글을 정말 삭제할까요?", {
      action: {
        label: "삭제",
        onClick: async () => {
          try {
            await deletePost(id);
            navigate("/");
            toast.success("게시글을 삭제했습니다.");
          } catch (err) {
            console.error("Failed to delete post:", err);
            toast.error("삭제에 실패했습니다.");
          }
        },
      },
    });
  };

  const handleReport = () => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    setTargetComment(null);
    setIsReportModalOpen(true);
    setShowMoreMenu(false);
  };

  const handleCommentReport = (comment) => {
    if (!token) {
      toast.error("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    setTargetComment(comment);
    setIsReportModalOpen(true);
  };

  const joinDisabled = !token || (!joined && (isFull || isClosed || !post.user_id));

  return (
    <main className={styles.container}>
      <div className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.moreMenuWrap}>
          <button className={styles.moreBtn} onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {showMoreMenu && (
            <div className={styles.moreMenu}>
              {isAuthor ? (
                <>
                  <div className={styles.moreItem} onClick={() => navigate(`/edit/${id}`)}>
                    수정
                  </div>
                  <div className={`${styles.moreItem} ${styles.delete}`} onClick={handleDelete}>
                    삭제
                  </div>
                </>
              ) : (
                <div className={`${styles.moreItem} ${styles.delete}`} onClick={handleReport}>
                  신고하기
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {post.image && <img className={styles.detailImg} src={post.image} alt="" />}

      <div className={styles.detailBody}>
        {/* ... (rest of the body) */}

        <div className={styles.statusRow}>
          <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
            {STATUS_EMOJI[status]} {status}
          </span>
          {Boolean(post.edited) && <span className={styles.editedBadge}>수정됨</span>}
        </div>

        {tags.length > 0 && (
          <div className={styles.tagsRow}>
            {tags.map(([, value]) => (
              <span key={value} className={styles.tag}>
                {value}
              </span>
            ))}
          </div>
        )}

        <h2 className={styles.detailTitle}>{post.title}</h2>

        <div className={styles.apptBox}>
          {dateStr && (
            <div className={styles.apptRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{dateStr}</span>
            </div>
          )}
          {post.place && (
            <div className={styles.apptRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{post.place}</span>
            </div>
          )}

          {post.latitude && post.longitude && (
            <div className={styles.apptMapWrap}>
              <MapPreview latitude={post.latitude} longitude={post.longitude} />
            </div>
          )}

          <div className={styles.apptRow}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>
              {post.participants || 0} / {post.capacity || 4}명 참여중
            </span>
          </div>
          <div className={styles.capBar}>
            <div className={styles.capFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <p className={styles.detailContent}>{post.content}</p>

        <div className={styles.detailMetaRow}>
          <span className={styles.detailAuthor}>
            작성자 {post.authorNickname || post.author || "이름 없음"}
          </span>
          <span className={styles.detailTime}>
            {post.createdAt ? new Date(post.createdAt).toLocaleString("ko-KR") : ""}
          </span>
        </div>

        <div className={styles.actionRow}>
          <button
            className={`${styles.actionBtnLg}${liked ? ` ${styles.liked}` : ""}`}
            onClick={toggleLike}
            disabled={isAuthor || !token || !post.user_id}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#ff4757" : "none"} stroke={liked ? "#ff4757" : "currentColor"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            찜하기 {post.likes || 0}
          </button>
          <button
            className={`${styles.actionBtnLg}${joined ? ` ${styles.joined}` : ""}`}
            onClick={handleJoinBtn}
            disabled={joinDisabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {joined ? "참여중" : isFull || isClosed ? "모집 마감" : "참여하기"}
          </button>
        </div>
      </div>

      <div className={styles.commentSection}>
        <div className={styles.commentTitleRow}>
          <span className={styles.commentTitleLabel}>댓글</span>
          <span className={styles.commentCountBadge}>{totalComments}</span>
        </div>

        <div className={styles.commentList}>
          {totalComments === 0 ? (
            <div className={styles.noComment}>첫 댓글을 남겨보세요.</div>
          ) : (
            post.comments?.map((comment, index) => (
              <CommentItem
                key={comment.id || index}
                comment={comment}
                commentIdx={index}
                onDelete={deleteComment}
                onUpdate={updateComment}
                onReport={handleCommentReport}
              />
            ))
          )}
        </div>

        <div className={styles.commentInputRow}>
          <input
            className={styles.commentInput}
            placeholder="댓글을 입력하세요."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button className={styles.commentSubmit} onClick={addComment}>
            등록
          </button>
        </div>
      </div>
      {isReportModalOpen && (
        <ReportModal
          onClose={() => {
            setIsReportModalOpen(false);
            setTargetComment(null);
          }}
          targetPostId={targetComment ? null : id}
          targetTitle={targetComment ? null : post.title}
          targetCommentId={targetComment?.id}
          targetUserId={targetComment ? targetComment.userId : post.user_id}
          targetName={targetComment ? targetComment.authorNickname : null}
          targetContent={targetComment ? targetComment.text : post.content}
        />
      )}
    </main>
  );
}
