import { useState } from "react";
import styles from "./ChatMembersModal.module.css";
import { getImageUrl } from "../api/instance";
import borderImg from "../assets/border.png";
import UserProfileModal from "./modals/UserProfileModal";

export default function ChatMembersModal({
  isOpen,
  onClose,
  members,
  authorNickname,
  onKick,
  currentUserId,
}) {
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  if (!isOpen) return null;

  const host = members.find((member) => member.nickname === authorNickname);
  const isMeHost = Number(host?.user_id) === Number(currentUserId);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
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
                  <div className={styles.info} onClick={() => setSelectedProfileId(member.user_id)} style={{ cursor: 'pointer' }}>
                    <div className={styles.avatarWrap}>
                      {isHost && (
                        <img src={borderImg} className={styles.avatarBorder} alt="" />
                      )}
                      <div className={styles.avatar}>
                        {member.profile_img ? (
                          <img src={getImageUrl(member.profile_img)} alt={nickname} />
                        ) : (
                          <span className={styles.defaultAvatar}>
                            {nickname.slice(0, 1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.nickname}>
                      {nickname}
                      {isHost && <span className={styles.hostBadge}>방장</span>}
                    </span>
                  </div>

                  {isMeHost && !isHost && (
                    <button
                      className={styles.kickBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${nickname}님을 강퇴하시겠습니까?`)) {
                          onKick(member);
                        }
                      }}
                    >
                      강퇴
                    </button>
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
    </>
  );
}
