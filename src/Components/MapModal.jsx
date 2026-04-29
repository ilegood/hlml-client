import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { getPosts } from "../api/posts";
import { useNavigate } from "react-router-dom";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 사이드바보다 위에 오도록 매우 높게 설정 */
  backdrop-filter: blur(8px);
`;

const ModalContent = styled.div`
  background: var(--color-sidebar);
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  border-radius: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border);
`;

const Header = styled.div`
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-active);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    padding: 5px;
    display: flex;
    align-items: center;
    &:hover { color: var(--color-active); }
  }
`;

const MapView = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
`;

const MapModal = ({ onClose }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  // 1. 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        // 위도, 경도가 모두 있는 데이터만 필터링
        const filtered = data.filter(p => p.latitude && p.longitude);
        setPosts(filtered);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };
    fetchPosts();
  }, []);

  // 2. 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;

    // 모달 애니메이션이 끝난 후 지도를 그리기 위해 약간의 지연(300ms) 추가
    const timer = setTimeout(() => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 7,
        };

        const map = new window.kakao.maps.Map(container, options);
        const bounds = new window.kakao.maps.LatLngBounds();
        let hasPoints = false;

        posts.forEach((post) => {
          // 숫자형 변환 필수 (Number)
          const lat = Number(post.latitude);
          const lng = Number(post.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            const position = new window.kakao.maps.LatLng(lat, lng);
            const marker = new window.kakao.maps.Marker({
              position: position,
              map: map,
            });

            // 마커 클릭 시 게시글 이동 커스텀 오버레이 또는 confirm
            window.kakao.maps.event.addListener(marker, 'click', () => {
              if (window.confirm(`'${post.title}' 게시글로 이동할까요?`)) {
                onClose();
                navigate(`/detail/${post.id}`);
              }
            });

            bounds.extend(position);
            hasPoints = true;
          }
        });

        // 마커가 있다면 모든 마커가 보이도록 지도 범위 조정
        if (hasPoints) {
          map.setBounds(bounds);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [posts, navigate, onClose]);

  return (
    <ModalWrapper onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>약속 지도 보기</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </Header>
        <MapView ref={mapRef} id="large-map" />
      </ModalContent>
    </ModalWrapper>
  );
};

export default MapModal;
