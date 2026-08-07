import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function TimePickerModal({ isPastTimeSlot, onClose, onSelect, selectedTime }) {
  const [hour, setHour] = useState(String(selectedTime || "12:00").slice(0, 2));
  const [minute, setMinute] = useState(String(selectedTime || "12:00").slice(3, 5));
  const value = `${hour}:${minute}`;
  return <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-[18px] backdrop-blur-[5px]" onMouseDown={onClose}>
    <div className="write-light-surface w-[min(520px,100%)] rounded-3xl border border-[var(--color-border)] bg-[var(--color-sidebar)] p-[22px] text-[var(--color-text)] shadow-[0_24px_70px_rgba(0,0,0,0.42)]" onMouseDown={(e) => e.stopPropagation()}>
      <div className="mb-[18px] flex items-center justify-between"><strong>{value}</strong><button type="button" onClick={onClose}>&times;</button></div>
      <div className="grid grid-cols-2 gap-3"><div className="grid max-h-[260px] gap-2 overflow-y-auto">{HOURS.map((item) => <button type="button" key={item} disabled={MINUTES.every((m) => isPastTimeSlot(`${item}:${m}`))} className={hour === item ? "rounded-xl bg-[var(--color-active)] p-2 text-white" : "rounded-xl border border-[var(--color-border)] p-2"} onClick={() => setHour(item)}>{item}</button>)}</div><div className="grid max-h-[260px] gap-2 overflow-y-auto">{MINUTES.map((item) => <button type="button" key={item} disabled={isPastTimeSlot(`${hour}:${item}`)} className={minute === item ? "rounded-xl bg-[var(--color-active)] p-2 text-white" : "rounded-xl border border-[var(--color-border)] p-2"} onClick={() => setMinute(item)}>{item}</button>)}</div></div>
      <button type="button" className="mt-4 w-full rounded-xl bg-[var(--color-active)] p-3 text-white" disabled={isPastTimeSlot(value)} onClick={() => { onSelect(value); onClose(); }}>선택 완료</button>
    </div>
  </div>;
}
