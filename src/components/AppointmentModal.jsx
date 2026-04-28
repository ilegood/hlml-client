import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { getPosts } from "../api/posts";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);

  .modal-content {
    background: var(--color-sidebar);
    width: 480px;
    max-height: 90vh;
    border-radius: 24px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    color: var(--color-text);
    overflow-y: auto;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    h2 { font-size: 20px; font-weight: 800; color: var(--color-active); }
    .close-btn { 
      background: none; border: none; cursor: pointer; color: var(--color-deactive);
      &:hover { color: var(--color-active); }
    }
  }

  /* 캘린더 디자인 */
  .calendar-container {
    background: var(--color-input-bg);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid var(--color-border);

    .cal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-weight: 700;

      .nav-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px 10px;
        color: var(--color-text);
        font-size: 18px;
        &:disabled { opacity: 0.2; cursor: not-allowed; }
      }
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      text-align: center;
      font-size: 12px;

      .day-label { font-weight: 700; opacity: 0.5; margin-bottom: 5px; }
      .day-cell {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        &:hover { background: var(--color-border); }
        &.today { border: 1.5px solid var(--color-active); }
        &.selected { background: var(--color-active); color: white; }
        &.other-month { opacity: 0.2; pointer-events: none; }

        .dot {
          width: 6px;
          height: 6px;
          background: #ffdb58; /* 노란색 점 */
          border-radius: 50%;
          position: absolute;
          bottom: 4px;
        }
      }
    }
  }

  /* 약속 리스트 */
  .appt-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    h3 { font-size: 14px; margin-bottom: 5px; }

    .appt-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: var(--color-input-bg);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: transform 0.1s;
      &:active { transform: scale(0.98); }

      .time-tag {
        background: var(--color-active);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }
      .info {
        flex: 1;
        .title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
        .place { font-size: 12px; opacity: 0.6; }
      }
    }

    .empty-msg {
      text-align: center;
      padding: 30px 0;
      font-size: 14px;
      color: var(--color-deactive);
      background: var(--color-input-bg);
      border-radius: 12px;
      border: 1px dashed var(--color-border);
    }
  }
`;

export default function AppointmentModal({ onClose }) {
  const { name } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  
  const today = new Date();
  const userId = name || "me";

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const allPosts = await getPosts();
        // 내가 작성자이거나 참가한 게시글 필터링
        const filtered = allPosts.filter(p => 
          p.author === userId || (Array.isArray(p.joinedBy) && p.joinedBy.includes(userId))
        );
        setAppointments(filtered);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };
    fetchAppts();
  }, [userId]);

  // 캘린더 계산 로직
  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = () => {
    // 오늘 기준 이전 달은 못 보게 하거나 제한 (사용자 요청은 앞으로 12개월)
    const prev = new Date(viewYear, viewMonth - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    const limit = new Date(today.getFullYear(), today.getMonth() + 12, 1);
    if (next < limit) {
      setCurrentMonth(next);
    }
  };

  const isToday = (d) => {
    return d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  const isSelected = (d) => {
    return d === selectedDay.getDate() && viewMonth === selectedDay.getMonth() && viewYear === selectedDay.getFullYear();
  };

  const getDayAppts = (d) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return appointments.filter(a => a.date === dateStr);
  };

  const selectedDateStr = `${selectedDay.getFullYear()}년 ${selectedDay.getMonth() + 1}월 ${selectedDay.getDate()}일`;
  const selectedDateAppts = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getFullYear() === selectedDay.getFullYear() && 
           d.getMonth() === selectedDay.getMonth() && 
           d.getDate() === selectedDay.getDate();
  });

  return (
    <ModalWrapper onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="header">
          <h2>내 약속 관리</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="calendar-container">
          <div className="cal-header">
            <button className="nav-btn" onClick={handlePrevMonth} disabled={viewMonth === today.getMonth() && viewYear === today.getFullYear()}>〈</button>
            <span>{viewYear}년 {viewMonth + 1}월</span>
            <button className="nav-btn" onClick={handleNextMonth}>〉</button>
          </div>
          <div className="days-grid">
            {['일','월','화','수','목','금','토'].map(d => <div key={d} className="day-label">{d}</div>)}
            
            {/* 이전 달의 마지막 날들 */}
            {Array.from({length: firstDayOfMonth}).map((_, i) => (
              <div key={`prev-${i}`} className="day-cell other-month">
                {prevMonthLastDay - firstDayOfMonth + i + 1}
              </div>
            ))}

            {/* 현재 달의 날들 */}
            {Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
              const hasAppt = getDayAppts(d).length > 0;
              return (
                <div 
                  key={d} 
                  className={`day-cell ${isToday(d) ? 'today' : ''} ${isSelected(d) ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(new Date(viewYear, viewMonth, d))}
                >
                  {d}
                  {hasAppt && <div className="dot" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="appt-list">
          <h3>{selectedDateStr} 약속</h3>
          {selectedDateAppts.length > 0 ? (
            selectedDateAppts.map((appt, idx) => (
              <div key={idx} className="appt-item" onClick={() => window.location.href = `/detail/${appt.id}`}>
                <div className="time-tag">{appt.time || "시간 미정"}</div>
                <div className="info">
                  <div className="title">{appt.title}</div>
                  <div className="place">{appt.place || "장소 미정"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-msg">선택한 날짜에 예정된 약속이 없습니다.</div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
