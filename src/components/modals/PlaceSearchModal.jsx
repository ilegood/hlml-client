import { useState } from "react";
import { toast } from "sonner";
import styles from "./PlaceSearchModal.module.css";

const PlaceSearchModal = ({ onClose, onSelect }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const searchPlaces = () => {
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setResults([]);
        toast.error("검색 결과가 없습니다.");
      } else {
        toast.error("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const handleSearch = () => {
    if (!keyword.trim()) return;

    if (!window.kakao || !window.kakao.maps) {
      toast.error("카카오 지도 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    window.kakao.maps.load(() => {
      if (!window.kakao.maps.services) {
        toast.error("카카오 장소 검색 서비스를 불러오지 못했습니다.");
        return;
      }

      searchPlaces();
    });
  };

  return (
    <div className={styles.modalWrapper} onMouseDown={onClose}>
      <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>장소 검색</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="장소나 주소를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            검색
          </button>
        </div>

        <div className={styles.resultsList}>
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className={styles.resultItem}
                onClick={() => onSelect(item)}
              >
                <span className={styles.placeName}>{item.place_name}</span>
                <span className={styles.address}>
                  {item.road_address_name || item.address_name}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.emptyResults}>
              검색 결과가 여기에 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceSearchModal;
