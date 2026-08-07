const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  if (!value) return "날짜 선택";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export default function DatePickerModal({
  calendarMonth,
  maxDate,
  minDate,
  selectedDate,
  setCalendarMonth,
  onClose,
  onSelect,
}) {
  const viewYear = calendarMonth.getFullYear();
  const viewMonth = calendarMonth.getMonth();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const monthLabel = calendarMonth.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
  const canMovePrev =
    toDateKey(new Date(viewYear, viewMonth - 1, 1)) >=
    minDate.slice(0, 8) + "01";
  const canMoveNext =
    toDateKey(new Date(viewYear, viewMonth + 1, 1)) <=
    maxDate.slice(0, 8) + "01";

  return (
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-[18px] backdrop-blur-[5px]"
      onMouseDown={onClose}
    >
      <div
        className="write-light-surface max-h-[min(760px,88vh)] w-[min(520px,100%)] overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-[22px] text-[var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-[18px] flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[var(--color-deactive)]">
              약속 날짜
            </span>
            <h3 className="mt-1 text-[21px] font-black">
              {formatDateLabel(selectedDate)}
            </h3>
          </div>
          <button
            type="button"
            className="write-light-control h-[34px] w-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[22px] leading-none text-[var(--color-text)]"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="mb-3.5 grid grid-cols-[72px_1fr_72px] items-center gap-2.5">
          <button
            type="button"
            className="write-light-control min-h-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] font-extrabold disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth - 1, 1))}
            disabled={!canMovePrev}
          >
            이전
          </button>
          <strong className="text-center text-base font-black">{monthLabel}</strong>
          <button
            type="button"
            className="write-light-control min-h-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] font-extrabold disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => setCalendarMonth(new Date(viewYear, viewMonth + 1, 1))}
            disabled={!canMoveNext}
          >
            다음
          </button>
        </div>

        <div className="grid min-h-[356px] grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              className="py-1.5 text-center text-xs font-black text-[var(--color-deactive)]"
              key={day}
            >
              {day}
            </div>
          ))}
          {calendarCells.map((day, index) => {
            if (!day) {
              return (
                <div
                  className="aspect-square rounded-[14px] border border-transparent bg-[color-mix(in_srgb,var(--color-input-bg)_42%,transparent)] opacity-35"
                  key={`blank-${index}`}
                />
              );
            }

            const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
            const disabled = dateKey < minDate || dateKey > maxDate;
            const selected = dateKey === selectedDate;

            return (
              <button
                type="button"
                key={dateKey}
                className={`write-light-control aspect-square rounded-[14px] border font-black transition-[transform,border-color,background-color] disabled:cursor-not-allowed disabled:opacity-25 ${
                  selected
                    ? "border-[var(--color-active)] bg-[var(--color-active)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)] hover:-translate-y-px hover:border-[var(--color-deactive)]"
                }`}
                disabled={disabled}
                onClick={() => {
                  onSelect(dateKey);
                  onClose();
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
