export const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
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
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

export const createPendingFileId = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${
    crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
  }`;

export const createClientMessageId = () =>
  `client-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export const formatAppointmentDateTime = (date, time) => {
  const dateText = date
    ? new Date(date).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })
    : "";
  const timeText = time ? String(time).slice(0, 5) : "";
  return [dateText, timeText].filter(Boolean).join(" ");
};

export const displayName = (nickname) => nickname || "이름 없음";
