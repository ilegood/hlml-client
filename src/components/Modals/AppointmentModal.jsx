import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { getPosts } from "../../api/posts";
import styles from "./AppointmentModal.module.css";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function AppointmentModal({ onClose }) {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const today = new Date();
  const currentUserId = userId ? String(userId) : null;

  const toDateKey = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  const formatTime = (value) => {
    if (!value) return "시간 미정";
    return String(value).slice(0, 5);
  };

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const allPosts = await getPosts();
        const filtered = allPosts.filter(
          (p) =>
            (currentUserId !== null &&
              String(p.user_id) === currentUserId) ||
            (currentUserId !== null &&
              Array.isArray(p.joinedUserIds) &&
              p.joinedUserIds.includes(currentUserId)),
        );
        setAppointments(filtered);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };
    fetchAppts();
  }, [currentUserId]);

  // ── 캘린더 계산 ────────────────────────────────────────
  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    const limit = new Date(today.getFullYear(), today.getMonth() + 12, 1);
    if (next < limit) setCurrentMonth(next);
  };

  const isToday = (d) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();
  const isSelected = (d) =>
    d === selectedDay.getDate() &&
    viewMonth === selectedDay.getMonth() &&
    viewYear === selectedDay.getFullYear();

  const getDayAppts = (d) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return appointments.filter((a) => toDateKey(a.date) === dateStr);
  };

  const selectedDateStr = `${selectedDay.getFullYear()}년 ${selectedDay.getMonth() + 1}월 ${selectedDay.getDate()}일`;
  const selectedDateAppts = appointments.filter((a) => {
    return (
      toDateKey(a.date) ===
      `${selectedDay.getFullYear()}-${String(selectedDay.getMonth() + 1).padStart(2, "0")}-${String(selectedDay.getDate()).padStart(2, "0")}`
    );
  });

  const isPrevDisabled =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <h2>내 약속 관리</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Calendar ── */}
        <div className={styles.calendarContainer}>
          <div className={styles.calHeader}>
            <button
              className={styles.navBtn}
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
            >
              〈
            </button>
            <span>
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button className={styles.navBtn} onClick={handleNextMonth}>
              〉
            </button>
          </div>

          <div className={styles.daysGrid}>
            {/* 요일 레이블 */}
            {DAY_LABELS.map((d) => (
              <div key={d} className={styles.dayLabel}>
                {d}
              </div>
            ))}

            {/* 이전 달 마지막 날들 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className={`${styles.dayCell} ${styles.otherMonth}`}
              >
                {prevMonthLastDay - firstDayOfMonth + i + 1}
              </div>
            ))}

            {/* 현재 달 날들 */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const hasAppt = getDayAppts(d).length > 0;
              const cellClass = [
                styles.dayCell,
                isToday(d) ? styles.today : "",
                isSelected(d) ? styles.selected : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={d}
                  className={cellClass}
                  onClick={() =>
                    setSelectedDay(new Date(viewYear, viewMonth, d))
                  }
                >
                  {d}
                  {hasAppt && <div className={styles.dot} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Appointment List ── */}
        <div className={styles.apptList}>
          <h3>{selectedDateStr} 약속</h3>
          {selectedDateAppts.length > 0 ? (
            selectedDateAppts.map((appt, idx) => (
              <div
                key={idx}
                className={styles.apptItem}
                onClick={() => (window.location.href = `/detail/${appt.id}`)}
              >
                <div className={styles.timeTag}>{formatTime(appt.time)}</div>
                <div className={styles.info}>
                  <div className={styles.infoTitle}>{appt.title}</div>
                  <div className={styles.infoPlace}>
                    {appt.place || "장소 미정"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyMsg}>
              선택한 날짜에 예정된 약속이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
