export const CATEGORY_MAP = {
  성별: ["남성", "여성", "혼성"],
  나이: ["10대", "20대", "30대", "40대", "50대 이상"],
  흡연: ["흡연자", "비흡연자"],
  음주: ["음주", "금주"],
  활동: ["식사", "운동", "수다", "게임", "산책", "창작", "휴식", "기타"],
};

export const STATUS_LIST = ["모집중", "모집완료"];
export const STATUS_EMOJI = { 모집중: "🟢", 모집완료: "🔴" };
export const STATUS_CLASS = { 모집중: "status-open", 모집완료: "status-full" };

export function getTimeAgo(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  if (hr < 24) return `${hr}시간 전`;
  return `${day}일 전`;
}

export function countComments(comments = []) {
  return comments.reduce((s, c) => s + 1 + (c.replies || []).length, 0);
}

export function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const dateFormatted = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
  
  if (timeStr) {
    const [h, m] = timeStr.split(":");
    return `${dateFormatted} ${h}:${m}`;
  }
  return dateFormatted;
}

export function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = () => rej();
    r.readAsDataURL(file);
  });
}

export function todayString() {
  return new Date().toISOString().split("T")[0];
}
