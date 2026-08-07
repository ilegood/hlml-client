import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { deleteUser } from "../../api/users";
import styles from "./QAModal.module.css";

const QA_DATA = [
  {
    id: 1,
    question: "회원가입은 어디에서 하나요?",
    answer:
      "홈 화면 또는 로그인 화면에서 회원가입 버튼을 눌러 진행할 수 있습니다.",
  },
  {
    id: 2,
    question: "게시글 작성은 어떻게 하나요?",
    answer:
      "상단의 게시글 작성 버튼을 누르고 카테고리와 내용을 입력한 뒤 등록하면 됩니다.",
  },
  {
    id: 3,
    question: "부적절한 사용자는 어떻게 신고하나요?",
    answer:
      "해당 사용자의 게시글이나 댓글 또는 프로필을 통해 신고하실 수 있습니다.",
  },
  {
    id: 4,
    question: "비밀번호를 변경할 수 있나요?",
    answer:
      "마이페이지의 프로필 편집 버튼을 눌러 현재 비밀번호와 새 비밀번호를 입력해 변경할 수 있습니다.",
  },
  {
    id: 5,
    question: "실시간 채팅방은 어떻게 이용하나요?",
    answer:
      "로그인한 뒤 참여한 게시글의 채팅방으로 들어가면 실시간으로 대화를 주고받을 수 있습니다.",
  },
];

export default function QAModal({ onClose }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const withdrawalLabel = useMemo(() => "회원탈퇴", []);

  const toggleItem = (id) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  const handleOpenWithdraw = () => {
    setConfirmText("");
    setShowConfirm(true);
  };

  const handleWithdraw = async () => {
    if (confirmText.trim() !== withdrawalLabel) return;

    setIsDeleting(true);
    try {
      await deleteUser();
      logout();
      onClose();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        error?.response?.data?.message ||
          "회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(e) => e.stopPropagation()}
      >
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
                <div className={styles.aText}>{item.answer}</div>
              </div>
            </div>
          ))}

          <div
            className={`${styles.qaItem} ${activeIndex === 6 ? styles.active : ""}`}
          >
            <button
              type="button"
              className={styles.question}
              onClick={() => toggleItem(6)}
            >
              <div className={styles.qText}>
                <span className={styles.qBadge}>Q.</span>
                회원탈퇴는 어디에서 진행하나요?
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
                회원탈퇴는 버튼을 누를 시 진행됩니다. 영구적으로 계정이
                삭제되며, 게시글 및 댓글 등 기록이 남지 않습니다.
                <div className={styles.withdrawalBox}>
                  <button
                    type="button"
                    className={styles.withdrawalBtn}
                    onClick={handleOpenWithdraw}
                  >
                    회원탈퇴
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div
          className={styles.confirmOverlay}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!isDeleting) setShowConfirm(false);
          }}
        >
          <div
            className={styles.confirmModal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3>회원탈퇴 확인</h3>
            <p>
              계정을 삭제하려면 아래 입력칸에 <strong>회원탈퇴</strong>를
              입력하세요. 삭제 후에는 복구할 수 없습니다.
            </p>
            <input
              className={styles.confirmInput}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="회원탈퇴"
              disabled={isDeleting}
            />
            <div className={styles.confirmBtns}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleWithdraw}
                disabled={isDeleting || confirmText.trim() !== withdrawalLabel}
              >
                {isDeleting ? "처리 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
