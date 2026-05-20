import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className={styles.overlay} onMouseDown={handleOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelLabel || "취소"}
          </button>
          <button
            className={`${styles.confirmBtn} ${danger ? styles.dangerBtn : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel || "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
