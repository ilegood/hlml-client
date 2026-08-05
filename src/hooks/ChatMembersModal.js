import { useState } from "react";
import { toast } from "sonner";
import styles from "../pages/ChatMembersModal.module.css";
import { getImageUrl } from "../api/instance";
import { blockUser } from "../api/friends";
import borderImg from "../assets/border.png";
import UserProfileModal from "../components/modals/UserProfileModal";
import ReportModal from "../components/modals/ReportModal";

export default function ChatMembersModal({
  isOpen,
  onClose,
  members,
  authorNickname,
  onKick,
  currentUserId,
}) {
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [blockingId, setBlockingId] = useState(null);

  if (!isOpen) return null;

  const host = members.find((member) => member.nickname === authorNickname);
  const isMeHost = Number(host?.user_id) === Number(currentUserId);

  const handleBlock = async (member) => {
    if (blockingId) return;
    setBlockingId(member.user_id);
    try {
      await blockUser(member.user_id);
      toast.success(`${member.nickname || "해당 사용자"}님이 차단되었습니다.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "차단에 실패했습니다.");
    } finally {
      setBlockingId(null);
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
              const isHost = nickname === authorNickname;

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
                            {nickname.slice(0, 1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.nickname}>
                      {nickname}
                    </span>
                  </div>

                  {isMeHost && !isHost && (
                    <button
                      className={styles.kickBtn}
                      onClick={(e) => {
                        e.stopPropagation();
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
                  {Number(member.user_id) !== Number(currentUserId) && (
                    <>
                      <button
                        className={styles.reportBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportTarget(member);
                        }}
                      >
                        신고
                      </button>
                      <button
                        className={styles.blockBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlock(member);
                        }}
                        disabled={blockingId === member.user_id}
                      >
                        {blockingId === member.user_id ? "..." : "차단"}
                      </button>
                    </>
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
