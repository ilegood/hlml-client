import React from "react";
import styles from "./ChatMembersModal.module.css";
import { getImageUrl } from "../api/instance";
import borderImg from "../assets/border.png";

export default function ChatMembersModal({
  isOpen,
  onClose,
  members,
  authorNickname,
  onKick,
  currentUserId,
}) {
  if (!isOpen) return null;

  // 현재 접속자가 방장인지 확인
  const isMeHost =
    members.find((m) => m.user_id === currentUserId)?.nickname ===
    authorNickname;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>채팅방 멤버 ({members.length})</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <ul className={styles.memberList}>
          {members.map((member) => (
            <li key={member.user_id} className={styles.memberItem}>
              <div className={styles.info}>
                <div className={styles.avatarWrap}>
                  <img src={borderImg} className={styles.avatarBorder} alt="" />
                  <div className={styles.avatar}>
                    {member.profile_img ? (
                      <img
                        src={getImageUrl(member.profile_img)}
                        alt={member.nickname}
                      />
                    ) : (
                      <span className={styles.defaultAvatar}>
                        {member.nickname.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={styles.nickname}>
                  {member.nickname}
                  {member.nickname === authorNickname && (
                    <span className={styles.hostBadge}>방장</span>
                  )}
                </span>
              </div>

              {/* 방장이고, 대상이 본인이 아닐 때만 강퇴 버튼 노출 */}
              {isMeHost && member.nickname !== authorNickname && (
                <button
                  className={styles.kickBtn}
                  onClick={() => {
                    if (
                      window.confirm(`${member.nickname}님을 강퇴하시겠습니까?`)
                    ) {
                      onKick(member);
                    }
                  }}
                >
                  강퇴
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
