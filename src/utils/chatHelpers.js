export const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

export const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "오늘";
  if (d.toDateString() === yesterday.toDateString()) return "어제";

  const options = { month: "long", day: "numeric" };
  if (d.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }

  return d.toLocaleDateString("ko-KR", options);
};

export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const isCompact = (prev, curr) => {
  if (!prev || prev.isSystem || curr.isSystem) return false;
  if (prev.userId !== curr.userId) return false;
  const diff = new Date(curr.time) - new Date(prev.time);
  return diff < 2 * 60 * 1000;
};

export const createClientMessageId = () =>
  `client-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export const createPendingFileId = (file) =>
  `${file.name}-${file.size}-${Date.now()}`;

export const formatAppointmentDateTime = (date, time) => {
  const now = new Date();
  const apptDate = new Date(date);
  const options = { month: "long", day: "numeric" };
  if (apptDate.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  const dateText = date ? apptDate.toLocaleDateString("ko-KR", options) : "";
  const timeText = time ? String(time).slice(0, 5) : "";
  return [dateText, timeText].filter(Boolean).join(" ");
};

export const displayName = (nickname) => nickname || "이름 없음";
