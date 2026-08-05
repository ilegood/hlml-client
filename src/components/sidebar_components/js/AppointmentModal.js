import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getPosts } from "../../../api/posts";
import styles from "../css/AppointmentModal.module.css";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_CELL_COUNT = 42;

const toDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const toLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const formatTime = (value) => {
  if (!value) return "시간 미정";
  return String(value).slice(0, 5);
};

const formatApptYear = (apptDateStr) => {
  const currentYear = new Date().getFullYear();
  const apptYear = new Date(apptDateStr).getFullYear();
  return apptYear !== currentYear ? `${apptYear}년 ` : "";
};

export default function AppointmentModal({ onClose }) {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const today = new Date();
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const currentUserId = userId ? String(userId) : null;

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const allPosts = await getPosts();
        const filtered = allPosts.filter(
          (post) =>
            currentUserId !== null &&
            (String(post.user_id) === currentUserId ||
              (Array.isArray(post.joinedUserIds) &&
                post.joinedUserIds.includes(currentUserId))),
        );
        setAppointments(filtered);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchAppts();
  }, [currentUserId]);

  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = Array.from(
    { length: CALENDAR_CELL_COUNT },
    (_, index) => {
      const dayNumber = index - firstDayOfMonth + 1;

      if (dayNumber < 1) {
        const day = prevMonthLastDay + dayNumber;
        return {
          key: `prev-${index}`,
          day,
          date: new Date(viewYear, viewMonth - 1, day),
          isCurrentMonth: false,
        };
      }

      if (dayNumber > daysInMonth) {
        const day = dayNumber - daysInMonth;
        return {
          key: `next-${index}`,
          day,
          date: new Date(viewYear, viewMonth + 1, day),
          isCurrentMonth: false,
        };
      }

      return {
        key: `current-${dayNumber}`,
        day: dayNumber,
        date: new Date(viewYear, viewMonth, dayNumber),
        isCurrentMonth: true,
      };
    },
  );

  const getDayAppts = (date) => {
    const dateStr = toLocalDateKey(date);
    return appointments.filter(
      (appointment) => toDateKey(appointment.date) === dateStr,
    );
  };

  const isToday = (date) => toLocalDateKey(date) === toLocalDateKey(today);
  const isSelected = (date) =>
    toLocalDateKey(date) === toLocalDateKey(selectedDay);

  const handlePrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev >= minMonth) setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    if (next <= maxMonth) setCurrentMonth(next);
  };

  const isPrevDisabled =
    viewMonth === minMonth.getMonth() && viewYear === minMonth.getFullYear();
  const isNextDisabled =
    viewMonth === maxMonth.getMonth() && viewYear === maxMonth.getFullYear();

  const selectedDateStr = `${selectedDay.getFullYear()}년 ${
    selectedDay.getMonth() + 1
  }월 ${selectedDay.getDate()}일`;
  const selectedDateAppts = getDayAppts(selectedDay);

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(e) => e.stopPropagation()}
      >
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

        <div className={styles.calendarContainer}>
          <div className={styles.calHeader}>
            <button
              className={styles.navBtn}
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              aria-label="이전 달"
              title="이전 달"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span>
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              className={styles.navBtn}
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              aria-label="다음 달"
              title="다음 달"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.daysGrid}>
            {DAY_LABELS.map((day) => (
              <div key={day} className={styles.dayLabel}>
                {day}
              </div>
            ))}

            {calendarDays.map(({ key, day, date, isCurrentMonth }) => {
              const dayAppts = isCurrentMonth ? getDayAppts(date) : [];
              const hasAppt = dayAppts.length > 0;
              const cellClass = [
                styles.dayCell,
                !isCurrentMonth ? styles.otherMonth : "",
                isCurrentMonth && isToday(date) ? styles.today : "",
                isCurrentMonth && isSelected(date) ? styles.selected : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={key}
                  className={cellClass}
                  onClick={() => {
                    if (isCurrentMonth) setSelectedDay(date);
                  }}
                  onMouseEnter={() =>
                    setHoveredDay(isCurrentMonth ? key : null)
                  }
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {day}
                  {hasAppt && <div className={styles.dot} />}
                  {hoveredDay === key && hasAppt && (
                    <div className={styles.dotPopup}>
                      {dayAppts.map((appt) => (
                        <div
                          key={appt.id}
                          className={styles.dotPopupItem}
                          onClick={(event) => {
                            event.stopPropagation();
                            window.location.href = `/detail/${appt.id}`;
                          }}
                        >
                          <span className={styles.dotPopupTime}>
                            {formatTime(appt.time)}
                          </span>
                          <span className={styles.dotPopupTitle}>
                            {appt.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.apptList}>
          <h3>{selectedDateStr} 약속</h3>
          {selectedDateAppts.length > 0 ? (
            selectedDateAppts.map((appt) => (
              <div
                key={appt.id}
                className={styles.apptItem}
                onClick={() => (window.location.href = `/detail/${appt.id}`)}
              >
                <div className={styles.timeTag}>
                  {formatApptYear(appt.date)}
                  {formatTime(appt.time)}
                </div>
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
