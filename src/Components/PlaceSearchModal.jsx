import { useState, useEffect } from "react";
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
  z-index: 5000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: var(--color-sidebar);
  width: 400px;
  max-height: 80vh;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
`;

const SearchInputWrap = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  input {
    flex: 1;
    padding: 10px 15px;
    border-radius: 10px;
    border: 1.5px solid var(--color-border);
    background: var(--color-input-bg);
    color: var(--color-text);
    outline: none;
    &:focus { border-color: var(--color-active); }
  }

  button {
    padding: 0 15px;
    background: var(--color-active);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
  }
`;

const ResultList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 10px; }
`;

const ResultItem = styled.div`
  padding: 15px;
  background: var(--color-input-bg);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-active);
    background: var(--color-input-focus-bg);
  }

  .place-name { font-size: 14px; font-weight: 700; color: var(--color-text); margin-bottom: 4px; }
  .address { font-size: 12px; color: #888; }
`;

const PlaceSearchModal = ({ onClose, onSelect }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (!keyword.trim()) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 없습니다.");
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <ModalWrapper onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <h3 style={{ margin: 0, fontSize: "16px" }}>장소 검색</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>✕</button>
        </div>
        
        <SearchInputWrap>
          <input 
            placeholder="장소명을 입력하세요 (예: 인덕대학교)" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>검색</button>
        </SearchInputWrap>

        <ResultList>
          {results.map((item) => (
            <ResultItem key={item.id} onClick={() => onSelect(item)}>
              <div className="place-name">{item.place_name}</div>
              <div className="address">{item.address_name}</div>
            </ResultItem>
          ))}
          {results.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#888", fontSize: "13px" }}>
              궁금한 장소를 검색해보세요!
            </div>
          )}
        </ResultList>
      </ModalContent>
    </ModalWrapper>
  );
};

export default PlaceSearchModal;
