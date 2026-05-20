import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/auth";
import { deleteUser } from "../../api/users";
import styles from "./QAModal.module.css";

const QA_DATA = [
  {
    id: 1,
    question: "약속 횟수는 언제 올라가나요?",
    answer:
      "약속 시간이 지난 시점에 해당 채팅방에 남아있는 경우에만 약속 횟수에 반영됩니다. 약속 전에 채팅방을 나가면 횟수에 포함되지 않습니다.",
  },
  {
    id: 2,
    question: "신고 기록은 왜 24시간 뒤에 사라지나요?",
    answer:
      "마이페이지의 신고 기록은 접수 상태를 확인하기 위한 최근 내역입니다. 신고가 접수된 시점부터 24시간이 지나면 목록에서 자동으로 보이지 않습니다.",
  },
  {
    id: 3,
    question: "내 약속은 어디에서 확인하나요?",
    answer:
      "마이페이지의 약속 관리에서 날짜별 예정 약속을 확인할 수 있습니다. 약속이 가까워지면 채팅 알림으로도 안내됩니다.",
  },
  {
    id: 4,
    question: "채팅방은 언제 삭제되나요?",
    answer:
      "약속 날짜가 지나면 채팅방 삭제 안내가 먼저 표시되고, 안내 시간이 지난 뒤 채팅방과 채팅 기록이 정리됩니다.",
  },
  {
    id: 5,
    question: "신고와 차단은 어떻게 다른가요?",
    answer:
      "신고는 운영 처리를 위해 문제 상황을 접수하는 기능이고, 차단은 내가 해당 사용자의 활동이나 대화를 보지 않도록 제한하는 기능입니다.",
  },
  {
    id: 6,
    question: "프로필 정보는 어디에서 수정하나요?",
    answer:
      "마이페이지의 수정 버튼을 누르면 닉네임, 소개, 프로필 이미지를 변경할 수 있습니다. 비밀번호 변경도 같은 화면에서 진행합니다.",
  },
  {
    id: 7,
    question: "게시글을 수정하거나 삭제할 수 있나요?",
    answer:
      "내가 작성한 게시글은 내 게시글 목록이나 게시글 상세 화면에서 수정할 수 있습니다. 약속 날짜와 시간처럼 약속 기준이 되는 정보는 수정이 제한될 수 있습니다.",
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
      <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
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
                type="button"
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
            className={`${styles.qaItem} ${activeIndex === 8 ? styles.active : ""}`}
          >
            <button
              type="button"
              className={styles.question}
              onClick={() => toggleItem(8)}
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
                아래 버튼에서 회원탈퇴를 진행할 수 있습니다. 탈퇴하면 계정이
                삭제되며, 작성한 게시글과 댓글 등 계정에 연결된 기록은 함께
                정리됩니다.
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
          onClick={() => !isDeleting && setShowConfirm(false)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
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
