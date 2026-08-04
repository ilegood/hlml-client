export const STATUS_OPEN = "모집중";
export const STATUS_CLOSED = "모집완료";

export const CATEGORY_MAP = {
  성별: ["남성", "여성", "무관"],
  나이: ["10대", "20대", "30대", "40대", "50대 이상"],
  흡연: ["흡연자", "비흡연자"],
  음주: ["음주", "금주"],
  인원: ["2명", "3명", "4명", "5명", "6명", "7명", "8명", "9명", "10명"],
  활동: ["식사", "운동", "수다", "게임", "공부", "창작", "휴식", "기타"],
};

export const STATUS_EMOJI = { [STATUS_OPEN]: "모집", [STATUS_CLOSED]: "완료" };
export const STATUS_CLASS = {
  [STATUS_OPEN]: "status-open",
  [STATUS_CLOSED]: "status-full",
};

export function normalizeStatus(status) {
  return String(status || "").trim() === STATUS_CLOSED
    ? STATUS_CLOSED
    : STATUS_OPEN;
}

export function getTimeAgo(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  if (hr < 24) return `${hr}시간 전`;
  if (day < 7) return `${day}일 전`;

  const options = {
    month: "long",
    day: "numeric",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("ko-KR", options);
}

export function countComments(comments = []) {
  return comments.reduce(
    (sum, comment) => sum + 1 + (comment.replies || []).length,
    0,
  );
}

export function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return null;

  let date;
  if (
    typeof dateStr === "string" &&
    dateStr.includes("-") &&
    !dateStr.includes("T")
  ) {
    const [year, month, day] = dateStr.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateStr);
  }

  if (Number.isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const options = {
    month: "long",
    day: "numeric",
    weekday: "short",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }

  const dateFormatted = date.toLocaleDateString("ko-KR", options);

  if (timeStr) {
    const [hour, minute] = String(timeStr).split(":");
    return `${dateFormatted} ${hour}:${minute}`;
  }
  return dateFormatted;
}

export function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentTimeString() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function nextYearTodayString() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
