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
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "오늘";
  if (date.toDateString() === yesterday.toDateString()) return "어제";

  const options = {
    month: "long",
    day: "numeric",
  };
  if (date.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }

  return date.toLocaleDateString("ko-KR", options);
};

export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const first = new Date(a);
  const second = new Date(b);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const isCompact = (prev, curr) => {
  if (!prev || prev.isSystem || curr.isSystem) return false;
  if (String(prev.userId) !== String(curr.userId)) return false;

  const diff = new Date(curr.time) - new Date(prev.time);
  return diff >= 0 && diff < 2 * 60 * 1000;
};

export const displayName = (nickname) => nickname || "이름 없음";

export const createClientMessageId = () =>
  `client-${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;

export const createPendingFileId = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${
    crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
  }`;

export const formatAppointmentDateTime = (date, time) => {
  if (date && typeof date === "object") {
    return formatAppointmentDateTime(date.date, date.time);
  }
  if (!date && !time) return "";

  const now = new Date();
  const appointmentDate = date ? new Date(date) : null;
  const options = {
    month: "long",
    day: "numeric",
  };

  if (appointmentDate && appointmentDate.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  const dateText = appointmentDate
    ? appointmentDate.toLocaleDateString("ko-KR", options)
    : "";
  const timeText = time ? String(time).slice(0, 5) : "";
  return [dateText, timeText].filter(Boolean).join(" ");
};

export const normalizeRoomAppointment = (info = {}) => ({
  date: info.date || "",
  time: info.time || "",
  place: info.place || "",
  latitude: info.latitude ? Number(info.latitude) : null,
  longitude: info.longitude ? Number(info.longitude) : null,
  capacity: Number(info.capacity) || 0,
  participants: Number(info.participants) || 0,
  status: info.status || "",
});

export const parseSystemMessagePayload = (content) => {
  if (!content || typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content);
    return ["appointment_change", "share_post"].includes(parsed?.kind)
      ? parsed
      : null;
  } catch {
    return null;
  }
};
