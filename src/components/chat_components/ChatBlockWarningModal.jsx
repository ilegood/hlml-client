import { displayName } from "../../utils/chatHelpers";

const ChatBlockWarningModal = ({ warning, onConfirm }) => {
  if (!warning) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/45">
      <div className="w-[min(420px,calc(100vw-32px))] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-[var(--color-text)] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <h3 className="mb-2.5 text-[18px]">
          차단한 사용자가 이 채팅방에 있습니다.
        </h3>
        <p className="mb-[18px] leading-[1.5] text-[#888]">
          {warning.users.map((user) => displayName(user.nickname)).join(", ")}
          님이 현재 이 그룹 채팅방에 참여 중입니다.
        </p>
        <button
          type="button"
          className="h-[38px] w-full rounded-md border-0 bg-[var(--color-active)] font-bold text-white"
          onClick={onConfirm}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default ChatBlockWarningModal;
