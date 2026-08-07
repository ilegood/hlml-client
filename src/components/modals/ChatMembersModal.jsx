import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./ChatMembersModal.module.css";
import { getImageUrl } from "../../api/instance";
import { addFriend, blockUser, getBlockedUsers, unblockUser } from "../../api/friends";
import borderImg from "../../assets/border.png";
import UserProfileModal from "./UserProfileModal";
import ReportModal from "./ReportModal";

export default function ChatMembersModal({
  isOpen,
  onClose,
  members,
  authorNickname,
  authorUserId,
  onKick,
  currentUserId,
}) {
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [blockingId, setBlockingId] = useState(null);
  const [blockedIds, setBlockedIds] = useState(() => new Set());
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    getBlockedUsers()
      .then((blockedUsers) => {
        if (!active) return;
        setBlockedIds(
          new Set((blockedUsers || []).map((user) => String(user.id))),
        );
      })
      .catch(() => {
        if (active) toast.error("차단 목록을 불러오지 못했습니다.");
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const host = members.find((member) =>
    authorUserId != null
      ? Number(member.user_id) === Number(authorUserId)
      : member.nickname === authorNickname,
  );
  const isMeHost = Number(host?.user_id) === Number(currentUserId);

  const handleBlock = async (member) => {
    if (blockingId) return;
    setBlockingId(member.user_id);
    try {
      await blockUser(member.user_id);
      setBlockedIds((current) =>
        new Set(current).add(String(member.user_id)),
      );
      toast.success(`${member.nickname || "해당 사용자"}님이 차단되었습니다.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "차단에 실패했습니다.");
    } finally {
      setBlockingId(null);
    }
  };

  const handleUnblock = async (member) => {
    if (blockingId) return;
    setBlockingId(member.user_id);
    try {
      await unblockUser(member.user_id);
      setBlockedIds((current) => {
        const next = new Set(current);
        next.delete(String(member.user_id));
        return next;
      });
      toast.success(`${member.nickname || "해당 사용자"}님의 차단을 해제했습니다.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "차단 해제에 실패했습니다.");
    } finally {
      setBlockingId(null);
    }
  };

  const handleAddFriend = async (member) => {
    try {
      const result = await addFriend(member.nickname);
      toast.success(result.message || `${member.nickname}님께 친구 요청을 보냈습니다.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "친구 요청에 실패했습니다.");
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <>
      <div className={styles.overlay} onMouseDown={onClose}>
        <div className={styles.drawer} onMouseDown={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>채팅방 멤버 ({members.length})</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          </div>
          <ul className={styles.memberList}>
            {members.map((member) => {
              const nickname = member.nickname || "이름 없음";
              const isHost = authorUserId != null
                ? Number(member.user_id) === Number(authorUserId)
                : nickname === authorNickname;

              return (
                <li key={member.user_id} className={styles.memberItem}>
                  <div
                    className={styles.info}
                    onClick={() => setSelectedProfileId(member.user_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.avatarWrap}>
                      {isHost && (
                        <img
                          src={borderImg}
                          className={styles.avatarBorder}
                          alt=""
                        />
                      )}
                      <div className={styles.avatar}>
                        {member.profile_img ? (
                          <img
                            src={getImageUrl(member.profile_img)}
                            alt={nickname}
                            style={{ backgroundColor: "white" }}
                          />
                        ) : (
                          <span className={styles.defaultAvatar}>
  {nickname.slice(0, 2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.nickname}>
                      {nickname}
                      {isHost && <span className={styles.hostBadge}>방장</span>}
                    </span>
                  </div>

                  {Number(member.user_id) !== Number(currentUserId) && (
                    <div className={styles.actionMenu}>
                      <button
                        type="button"
                        className={styles.menuBtn}
                        aria-label={`${nickname}님 메뉴`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((current) =>
                            current === member.user_id ? null : member.user_id,
                          );
                        }}
                      >
                        ⋮
                      </button>
                      {openMenuId === member.user_id && (
                        <div className={styles.actionDropdown} onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => handleAddFriend(member)}>
                            친구요청
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              blockedIds.has(String(member.user_id))
                                ? handleUnblock(member)
                                : handleBlock(member);
                            }}
                            disabled={blockingId === member.user_id}
                          >
                            {blockingId === member.user_id
                              ? "처리 중..."
                              : blockedIds.has(String(member.user_id))
                                ? "차단 해제"
                                : "차단"}
                          </button>
                          {isMeHost && !isHost && (
                            <button
                              type="button"
                              className={styles.dangerMenuItem}
                              onClick={() => {
                                setOpenMenuId(null);
                                toast(`${nickname}님을 강퇴하시겠습니까?`, {
                                  action: {
                                    label: "강퇴",
                                    onClick: () => onKick(member),
                                  },
                                  duration: 4000,
                                });
                              }}
                            >
                              강퇴
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.dangerMenuItem}
                            onClick={() => {
                              setOpenMenuId(null);
                              setReportTarget(member);
                            }}
                          >
                            신고
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {selectedProfileId && (
        <UserProfileModal
          userId={selectedProfileId}
          currentUserId={currentUserId}
          onClose={() => setSelectedProfileId(null)}
        />
      )}

      {reportTarget && (
        <ReportModal
          targetUser={reportTarget}
          targetUserId={reportTarget.user_id}
          targetName={reportTarget.nickname}
          onClose={() => setReportTarget(null)}
        />
      )}
    </>
  );
}
