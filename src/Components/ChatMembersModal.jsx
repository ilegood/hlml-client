import { useEffect, useState } from "react";
import { getImageUrl } from "../api/instance";
import styles from "./ChatMembersModal.module.css";
import borderImg from "../assets/border.png";

export default function ChatMembersModal({ isOpen, onClose, members, authorNickname }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>대화 상대 ({members.length}명)</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.memberList}>
          {members.map((member) => (
            <div key={member.user_id} className={styles.memberItem}>
              <div className={styles.avatarWrap}>
                {member.nickname === authorNickname && (
                  <img src={borderImg} className={styles.avatarBorder} alt="host-border" />
                )}
                <div className={styles.avatar}>
                  {member.profile_img ? (
                    <img src={getImageUrl(member.profile_img)} alt={member.nickname} />
                  ) : (
                    <div className={styles.defaultAvatar}>{member.nickname?.slice(0, 1)}</div>
                  )}
                </div>
              </div>
              <div className={styles.info}>
                <span className={styles.nickname}>{member.nickname}</span>
                {member.nickname === authorNickname && (
                  <span className={styles.hostBadge}>방장</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
