import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const PageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  .header {
    display: flex; align-items: center; gap: 15px; margin-bottom: 30px;
    .back-btn { background: none; border: none; cursor: pointer; color: var(--color-text); }
    h2 { font-size: 24px; font-weight: 800; }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .empty {
    text-align: center; padding: 100px 0; color: var(--color-deactive);
    .icon { font-size: 48px; margin-bottom: 10px; }
  }
`;

export default function LikesPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2>찜 목록</h2>
      </div>

      <div className="empty">
        <div className="icon">⭐</div>
        <p>찜한 게시글이 없습니다.</p>
      </div>
    </PageWrapper>
  );
}
