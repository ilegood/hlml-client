import { useState, useContext } from "react";
import styles from "./QAModal.module.css";
import { deleteUser } from "../api/users";
import { AuthContext } from "../context/auth";

const QA_DATA = [
  {
    id: 1,
    question: "할래말래 서비스는 어떤 서비스인가요?",
    answer:
      "할래말래는 일상 속에서 함께할 동네 친구를 찾거나, 관심사 기반의 소모임을 모집하고 참여할 수 있는 커뮤니티 서비스입니다.",
  },
  {
    id: 2,
    question: "게시글 작성은 어떻게 하나요?",
    answer:
      "홈 화면 상단의 '게시글 작성' 버튼을 누르거나, 사이드바의 '게시글쓰기' 메뉴를 통해 원하는 카테고리와 내용을 입력하여 등록할 수 있습니다.",
  },
  {
    id: 3,
    question: "부적절한 사용자를 신고하고 싶어요.",
    answer:
      "해당 사용자의 게시글이나 댓글 또는 프로필을 통해 신고하실 수 있습니다. 마이페이지의 '신고 내역'에서 신고를 제출하실 수도 있습니다.",
  },
  {
    id: 4,
    question: "비밀번호를 변경하고 싶어요.",
    answer:
      "마이페이지 상단의 '프로필 편집' 버튼을 눌러 현재 비밀번호와 새 비밀번호를 입력하여 변경하실 수 있습니다.",
  },
  {
    id: 5,
    question: "실시간 채팅방은 누구나 만들 수 있나요?",
    answer:
      "로그인한 회원이라면 누구나 '그룹' 메뉴를 통해 원하는 주제의 채팅방을 자유롭게 개설하고 참여할 수 있습니다.",
  },
  {
    id: 6,
    question: "회원 탈퇴를 하고 싶어요.",
    answer:
      "회원 탈퇴 시 모든 활동 내역과 개인정보가 삭제되며 복구할 수 없습니다. 탈퇴를 원하시면 아래 버튼을 눌러주세요.",
    isWithdrawal: true
  },
];

export default function QAModal({ onClose }) {
  const { logout } = useContext(AuthContext);
  const [activeIndex, setActiveId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const toggleItem = (id) => {
    setActiveId(activeIndex === id ? null : id);
  };

  const handleWithdrawalClick = () => {
    setShowConfirm(true);
    setConfirmText(""); // Reset text when opening
  };

  const handleWithdrawalSubmit = async () => {
    if (confirmText === "회원탈퇴") {
      try {
        await deleteUser();
        alert("회원 탈퇴가 완료되었습니다.");
        logout();
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>자주 묻는 질문 (Q&A)</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg
              width="24"
              height="24"
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

        <div className={styles.qaList}>
          {QA_DATA.map((item) => (
            <div
              key={item.id}
              className={`${styles.qaItem} ${activeIndex === item.id ? styles.active : ""}`}
            >
              <button
                className={styles.question}
                onClick={() => toggleItem(item.id)}
              >
                <div className={styles.qText}>
                  <span className={styles.qBadge}>Q.</span>
                  {item.question}
                </div>
                <div className={styles.arrow}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </button>
              <div className={styles.answer}>
                <div className={styles.aText}>
                  {item.answer}
                  {item.isWithdrawal && (
                    <div className={styles.withdrawalBox}>
                      <button 
                        className={styles.withdrawalBtn}
                        onClick={handleWithdrawalClick}
                      >
                        회원 탈퇴하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>정말 탈퇴하시겠습니까?</h3>
            <p>탈퇴를 원하시면 아래에 <strong>'회원탈퇴'</strong>를 입력해주세요.</p>
            <input 
              type="text" 
              placeholder="회원탈퇴" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={styles.confirmInput}
              autoFocus
            />
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowConfirm(false)}>취소</button>
              <button 
                className={styles.submitBtn} 
                onClick={handleWithdrawalSubmit}
                disabled={confirmText !== "회원탈퇴"}
              >
                탈퇴 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
