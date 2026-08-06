const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DatePickerModal({ calendarMonth, maxDate, minDate, selectedDate, setCalendarMonth, onClose, onSelect }) {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= days ? day : null;
  });
  const monthKey = toDateKey(new Date(year, month, 1));
  const canPrev = monthKey > minDate.slice(0, 8) + "01";
  const canNext = monthKey < maxDate.slice(0, 8) + "01";
  return <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-[18px] backdrop-blur-[5px]" onMouseDown={onClose}>
    <div className="write-light-surface w-[min(520px,100%)] rounded-3xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-[22px] text-[var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]" onMouseDown={(e) => e.stopPropagation()}>
      <div className="mb-[18px] flex items-center justify-between"><strong>{selectedDate}</strong><button type="button" onClick={onClose}>&times;</button></div>
      <div className="mb-3.5 grid grid-cols-[72px_1fr_72px] items-center gap-2.5"><button type="button" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} disabled={!canPrev}>이전</button><strong className="text-center">{calendarMonth.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</strong><button type="button" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} disabled={!canNext}>다음</button></div>
      <div className="grid grid-cols-7 gap-2">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <span className="text-center text-xs" key={day}>{day}</span>)}{cells.map((day, i) => day ? <button type="button" key={toDateKey(new Date(year, month, day))} disabled={toDateKey(new Date(year, month, day)) < minDate || toDateKey(new Date(year, month, day)) > maxDate} className={toDateKey(new Date(year, month, day)) === selectedDate ? "rounded-xl bg-[var(--color-active)] p-2 text-white" : "rounded-xl border border-[var(--color-border)] p-2"} onClick={() => { onSelect(toDateKey(new Date(year, month, day))); onClose(); }}>{day}</button> : <span key={`blank-${i}`} />)}</div>
    </div>
  </div>;
}
