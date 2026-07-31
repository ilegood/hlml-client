import styles from "./chatStyles.js";

const ChatScrollButton = ({ onClick, title, ariaLabel, label }) => (
  <button
    type="button"
    className={styles.scrollToBottom}
    onClick={onClick}
    title={title}
    aria-label={ariaLabel}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
    <span>{label}</span>
  </button>
);

export default ChatScrollButton;
