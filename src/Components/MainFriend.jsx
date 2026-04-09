import "./MainFriend.css";

const MainFriend = () => {
  return (
    <div class="sidebar-wrapper">
      <button class="toggle-btn" id="toggleBtn">
        〉
      </button>
      <div class="friend-sidebar" id="sidebarContent">
        <div class="search-section">
          <input type="text" placeholder="친구 검색" class="search-input" />
        </div>

        <div class="scroll-container">
          <div class="category-section">
            <h3 class="category-title">온라인 ▾</h3>
            <table class="friend-table">
              <tbody id="onlineList"></tbody>
            </table>
          </div>

          <div class="category-section">
            <h3 class="category-title">오프라인</h3>
            <table class="friend-table">
              <tbody id="offlineList"></tbody>
            </table>
          </div>
        </div>
        <div class="friend-detail-card hidden" id="detailCard">
          <div class="detail-header">
            <div class="detail-avatar-large"></div>
          </div>
          <div class="detail-body">
            <h4 id="detailName">이름</h4>
            <p id="detailProfile">상태 메시지</p>
            <div class="detail-icons">
              <span>안녕하세요.</span>
              <br />
              <span></span>
            </div>
            <div id="memoDisplayArea" class="memo-display hidden">
              <p id="savedMemoText"></p>
            </div>
            <button class="detail-action-btn" id="memoBtn">
              메모 추가
            </button>
            <div id="memoInputArea" class="memo-input-container hidden">
              <textarea
                id="memoInput"
                placeholder="이 친구에 대한 메모를 남겨보세요..."
              ></textarea>
              <div class="memo-actions">
                <button id="saveMemoBtn" class="save-btn">
                  저장
                </button>
                <button id="cancelMemoBtn" class="cancel-btn">
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MainFriend;
