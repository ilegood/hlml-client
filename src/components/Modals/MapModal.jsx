import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { getPosts } from "../../api/posts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

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
  z-index: 9999;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled.div`
  background: var(--color-sidebar);
  width: 90%;
  max-width: 1100px;
  height: 85vh;
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
    &:hover {
      color: var(--color-active);
    }
  }
`;

const MapViewContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const MapView = styled.div`
  flex: 1;
  height: 100%;
  background: #f0f0f0;
`;

const SidePanel = styled.div`
  width: 320px;
  background: var(--color-sidebar);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 10;

  @media (max-width: 768px) {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    transform: ${(props) => (props.$isOpen ? "translateX(0)" : "translateX(100%)")};
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
  }
`;

const EmptyPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-deactive);
  padding: 40px;
  text-align: center;
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 14px;
    font-weight: 600;
  }
`;

const PostInfoBox = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const PostTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
`;

const PostMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.8;
  
  svg {
    color: var(--color-active);
    flex-shrink: 0;
  }
`;

const PostImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 12px;
  background: #eee;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const NavBtn = styled.a`
  width: 100%;
  padding: 12px;
  background: #07b1bc;
  color: white;
  border-radius: 10px;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const DetailBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--color-active);
  color: white;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const MapModal = ({ onClose }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { name: currentUserId } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        const filtered = data.filter((p) => {
          const hasLocation = p.latitude && p.longitude;
          const isAuthor = p.author === currentUserId;
          const isLiked = (p.likedBy || []).includes(currentUserId);
          const isJoined = (p.joinedBy || []).includes(currentUserId);
          
          return hasLocation && (isAuthor || isLiked || isJoined);
        });
        setPosts(filtered);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };
    fetchPosts();
  }, [currentUserId]);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;

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
          const lat = Number(post.latitude);
          const lng = Number(post.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            const position = new window.kakao.maps.LatLng(lat, lng);
            const isAuthor = post.author === currentUserId;

            let markerImage = null;
            if (isAuthor) {
              const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 
              const imageSize = new window.kakao.maps.Size(24, 35); 
              markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);
            }

            const marker = new window.kakao.maps.Marker({
              position: position,
              map: map,
              image: markerImage,
              title: post.title
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              setSelectedPost(post);
              map.panTo(position);
            });

            bounds.extend(position);
            hasPoints = true;
          }
        });

        if (hasPoints) {
          map.setBounds(bounds);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [posts, currentUserId]);

  return (
    <ModalWrapper onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>약속 지도 보기</h2>
          <button className="close-btn" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </Header>
        
        <MapViewContainer>
          <MapView ref={mapRef} id="large-map" />
          
          <SidePanel $isOpen={!!selectedPost}>
            {selectedPost ? (
              <PostInfoBox>
                {selectedPost.image && <PostImage src={selectedPost.image} alt="" />}
                <PostTitle>{selectedPost.title}</PostTitle>
                
                <PostMeta>
                  <MetaItem>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {selectedPost.place}
                  </MetaItem>
                  <MetaItem>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {selectedPost.date} {selectedPost.time}
                  </MetaItem>
                  <MetaItem>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {selectedPost.participants} / {selectedPost.capacity || 2}명 참여중
                  </MetaItem>
                </PostMeta>

                <ActionButtons>
                  <NavBtn 
                    href={`https://map.kakao.com/link/to/${selectedPost.place},${selectedPost.latitude},${selectedPost.longitude}`} 
                    target="_blank"
                  >
                    길찾기 (카카오맵)
                  </NavBtn>
                  <DetailBtn onClick={() => {
                    onClose();
                    navigate(`/detail/${selectedPost.id}`);
                  }}>
                    게시글 상세보기
                  </DetailBtn>
                </ActionButtons>
              </PostInfoBox>
            ) : (
              <EmptyPanel>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>마커를 클릭하면<br />약속 정보를 확인할 수 있습니다.</p>
              </EmptyPanel>
            )}
          </SidePanel>
        </MapViewContainer>
      </ModalContent>
    </ModalWrapper>
  );
};

export default MapModal;