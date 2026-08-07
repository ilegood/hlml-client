import { useEffect, useState } from "react";
import { toast } from "sonner";
import instance from "../../api/instance";
import ProfileAvatar from "../ProfileAvatar";

const ModalWrapper = ({ children, ...props }) => <div {...props} className="pointer-events-auto fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm [&>div]:w-[480px]">{children}</div>;
/* Tailwind component styles are kept local to this modal. */
/*
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
  pointer-events: auto;

  .modal-content {
    background: var(--color-sidebar);
    width: 420px;
    border-radius: 24px;
    padding: 30px;
    color: var(--color-text);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    h2 {
      font-size: 20px;
      font-weight: 800;
      color: #eb4d4b;
    }
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-deactive);
    }
  }

  .target-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-input-bg);
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 14px;
    border: 1px solid var(--color-border);
    img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--color-avatar-placeholder, #555);
    }
    .target-avatar-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-avatar-placeholder, #555);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    .target-name {
      font-weight: 700;
      font-size: 14px;
    }
    margin-bottom: 20px;
    padding: 12px;
    background: var(--color-input-bg);
    border-radius: 12px;
    font-size: 14px;
    border: 1px solid var(--color-border);

    strong {
      color: #eb4d4b;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
    label {
      font-size: 13px;
      font-weight: 700;
      opacity: 0.8;
    }

    select,
    textarea {
      width: 100%;
      background: var(--color-input-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 14px;
      color: var(--color-text);
      outline: none;
      &:focus {
        border-color: #eb4d4b;
      }
    }
    select {
      padding-right: 44px;
    }
    textarea {
      height: 120px;
      resize: none;
    }
  }

  .submit-btn {
    width: 100%;
    padding: 16px;
    background: #eb4d4b;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:disabled {
      background: var(--color-deactive);
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
*/

const REASON_PLACEHOLDER = "신고 사유를 선택해주세요";

export default function ReportModal({
  onClose,
  targetUserId,
  targetPostId,
  targetCommentId,
  targetName,
  targetTitle,
  targetContent,
  targetUser,
  allowUserSearch = false,
  onSubmitted,
}) {
  const [reason, setReason] = useState(REASON_PLACEHOLDER);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(targetUser || null);

  useEffect(() => {
    if (!allowUserSearch || !searchQuery.trim() || selectedUser) {
      setSearchResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await instance.get("/users/search", {
          params: { q: searchQuery.trim() },
        });
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("User search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [allowUserSearch, searchQuery, selectedUser]);

  const handleSubmit = async () => {
    const selectedTargetUserId = allowUserSearch
      ? selectedUser?.user_id || selectedUser?.id
      : targetUserId || targetUser?.user_id;

    if (allowUserSearch && !selectedTargetUserId) {
      toast.error("검색 결과에서 유저를 선택해주세요.");
      return;
    }
    if (reason === REASON_PLACEHOLDER) {
      toast.error("신고 사유를 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("상세 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await instance.post("/reports", {
        targetUserId: selectedTargetUserId,
        targetPostId,
        targetCommentId,
        targetTitle,
        targetContent,
        reason,
        content: content.trim(),
      });
      toast.success("신고가 접수되었습니다.");
      onSubmitted?.();
      onClose();
    } catch (err) {
      console.error("Report failed:", err);
      toast.error(err.response?.data?.message || "신고 접수에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="w-[420px] max-w-full rounded-3xl bg-[var(--color-sidebar)] p-6 text-[var(--color-text)] shadow-[0_20px_50px_rgba(0,0,0,0.35)] [&_.target-info]:mb-4 [&_.target-info]:rounded-xl [&_.target-info]:border [&_.target-info]:border-[var(--color-border)] [&_.target-info]:bg-[var(--color-input-bg)] [&_.target-info]:p-3 [&_.target-info]:text-sm [&_.target-info]:leading-6 [&_.target-info]:text-[var(--color-text)] [&_.target-info]:[&>img]:h-9 [&_.target-info]:[&>img]:w-9 [&_.target-info]:[&>img]:rounded-full [&_.target-info]:[&>img]:object-cover [&_.target-avatar-placeholder]:flex [&_.target-avatar-placeholder]:h-9 [&_.target-avatar-placeholder]:w-9 [&_.target-avatar-placeholder]:items-center [&_.target-avatar-placeholder]:justify-center [&_.target-avatar-placeholder]:rounded-full [&_.target-avatar-placeholder]:bg-[var(--color-avatar-placeholder,#555)] [&_.target-avatar-placeholder]:font-bold [&_.target-avatar-placeholder]:text-white [&_.form-group]:mb-5 [&_.form-group]:flex [&_.form-group]:flex-col [&_.form-group]:gap-2 [&_.form-group_label]:text-[13px] [&_.form-group_label]:font-bold [&_.form-group_label]:opacity-80 [&_.form-group_select]:w-full [&_.form-group_select]:rounded-xl [&_.form-group_select]:border-[1.5px] [&_.form-group_select]:border-[var(--color-border)] [&_.form-group_select]:bg-[var(--color-input-bg)] [&_.form-group_select]:p-3 [&_.form-group_select]:text-sm [&_.form-group_select]:text-[var(--color-text)] [&_.form-group_textarea]:h-[120px] [&_.form-group_textarea]:w-full [&_.form-group_textarea]:resize-none [&_.form-group_textarea]:rounded-xl [&_.form-group_textarea]:border-[1.5px] [&_.form-group_textarea]:border-[var(--color-border)] [&_.form-group_textarea]:bg-[var(--color-input-bg)] [&_.form-group_textarea]:p-3 [&_.form-group_textarea]:text-sm [&_.form-group_textarea]:text-[var(--color-text)] [&_.submit-btn]:w-full [&_.submit-btn]:rounded-xl [&_.submit-btn]:border-0 [&_.submit-btn]:bg-[#eb4d4b] [&_.submit-btn]:p-3.5 [&_.submit-btn]:font-extrabold [&_.submit-btn]:text-white [&_.submit-btn]:hover:opacity-90" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-xl font-extrabold text-[#eb4d4b]">
            {targetCommentId
              ? "댓글 신고하기"
              : targetPostId
                ? "게시글 신고하기"
                : "신고하기"}
          </h2>
          <button type="button" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[var(--color-deactive)] transition-colors hover:bg-[var(--color-input-bg)] hover:text-[#eb4d4b]" onClick={onClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="target-info">
          {allowUserSearch ? (
            <div className="w-full">
              {selectedUser ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left text-[var(--color-text)]"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  title="클릭해서 유저 다시 검색"
                >
                  <span>신고대상 유저 :</span>
                  <ProfileAvatar profileImg={selectedUser.profile_img} nickname={selectedUser.nickname} size={32} />
                  <strong className="text-sm">{selectedUser.nickname}</strong>
                </button>
              ) : (
                <>
                  <label className="mb-2 block text-[13px] font-bold opacity-80">유저 검색</label>
                  <input
                    className="w-full rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[#eb4d4b]"
                    placeholder="신고할 유저의 닉네임을 입력하세요"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoComplete="off"
                  />
                </>
              )}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar)]">
                  {searchResults.map((user, index) => (
                    <button
                      type="button"
                      key={`${user.user_id ?? user.id}-${index}`}
                      className="flex w-full items-center gap-3 border-b border-[var(--color-border)] bg-transparent p-3 text-left text-sm text-[var(--color-text)] last:border-0 hover:bg-[var(--color-item-hover)]"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery(user.nickname || "");
                        setSearchResults([]);
                      }}
                    >
                      <ProfileAvatar profileImg={user.profile_img} nickname={user.nickname} size={32} />
                      <span>{user.nickname}</span>
                    </button>
                  ))}
                </div>
              )}
              {isSearching && <p className="mt-2 text-xs text-[var(--color-deactive)]">검색 중...</p>}
            </div>
          ) : targetCommentId ? (
            <>
              신고 대상 댓글 작성자:{" "}
              <strong>{targetName || "이름 없음"}</strong>
              <div
                style={{
                  marginTop: "8px",
                  opacity: 0.8,
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                "{targetContent?.substring(0, 50)}
                {targetContent?.length > 50 ? "..." : ""}"
              </div>
            </>
          ) : targetPostId ? (
            <>
              신고 대상 게시글: <strong>{targetTitle || "제목 없음"}</strong>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span>신고대상 유저 :</span>
              <ProfileAvatar
                profileImg={targetUser?.profile_img}
                nickname={targetUser?.nickname || targetName}
                size={28}
              />
              <strong>{targetUser?.nickname || targetName || "이름 없음"}</strong>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>신고 사유</label>
          <select className="w-full rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[#eb4d4b]" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>{REASON_PLACEHOLDER}</option>
            {targetCommentId ? (
              <>
                <option>부적절한 홍보/스팸</option>
                <option>욕설 및 비하 발언</option>
                <option>부적절한 내용</option>
                <option>도배성 댓글</option>
                <option>기타</option>
              </>
            ) : targetPostId ? (
              <>
                <option>부적절한 홍보/스팸</option>
                <option>부적절한 이미지</option>
                <option>욕설/비하 발언</option>
                <option>낚시/거짓 정보</option>
                <option>기타</option>
              </>
            ) : (
              <>
                <option>부적절한 닉네임</option>
                <option>스팸/광고</option>
                <option>욕설 및 비하 발언</option>
                <option>노쇼 (약속 미이행)</option>
                <option>기타</option>
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label>상세 내용</label>
          <textarea
            className="h-[120px] w-full resize-none rounded-xl border-[1.5px] border-[var(--color-border)] bg-[var(--color-input-bg)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[#eb4d4b]"
            placeholder="구체적인 상황을 설명해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "제출 중..." : "신고 제출"}
        </button>
      </div>
    </ModalWrapper>
  );
}
