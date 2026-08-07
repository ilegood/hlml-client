
const ChatScrollButton = ({ onClick, title, ariaLabel, label }) => (
  <button
    type="button"
    className={"[position:fixed] [bottom:88px] [left:50%] [transform:translateX(-50%)] [background:var(--color-bg)] [border:1px_solid_var(--color-border)] [color:var(--color-text)] [min-width:36px] [height:36px] [padding:0_12px] [border-radius:18px] [display:flex] [align-items:center] [justify-content:center] [gap:6px] [cursor:pointer] [box-shadow:0_4px_12px_rgba(0,_0,_0,_0.2)] [z-index:100] [animation:fadeIn_0.15s_ease-out] [transition:background_0.15s]"}
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
