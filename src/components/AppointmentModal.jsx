import styled from "styled-components";

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
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { background: var(--color-border); }
        &.has-event { 
          background: var(--color-active); 
          color: white; 
          font-weight: 700;
          box-shadow: 0 4px 8px rgba(253, 147, 25, 0.3);
        }
        &.today { border: 1.5px solid var(--color-active); }
      }
    }
  }

  /* 약속 리스트 */
  .appt-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .appt-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: var(--color-input-bg);
      border-radius: 12px;
      border: 1px solid var(--color-border);

      .time-tag {
        background: var(--color-active);
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
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
  // 샘플 데이터 (빈 배열로 변경)
  const events = []; 
  const todayAppts = [];

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
            <span>2024년 4월</span>
            <div style={{display:'flex', gap:'10px'}}>
              <span>〈</span><span>〉</span>
            </div>
          </div>
          <div className="days-grid">
            {['일','월','화','수','목','금','토'].map(d => <div key={d} className="day-label">{d}</div>)}
            {Array.from({length: 30}, (_, i) => i + 1).map(d => (
              <div key={d} className={`day-cell ${events.includes(d) ? 'has-event' : ''} ${d === 23 ? 'today' : ''}`}>
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="appt-list">
          <h3 style={{fontSize:'14px', marginBottom:'10px'}}>오늘의 약속</h3>
          {todayAppts.length > 0 ? (
            todayAppts.map((appt, idx) => (
              <div key={idx} className="appt-item">
                <div className="time-tag">{appt.time}</div>
                <div className="info">
                  <div className="title">{appt.title}</div>
                  <div className="place">{appt.place}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-msg">오늘 예정된 약속이 없습니다.</div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
