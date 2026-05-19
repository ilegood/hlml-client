import { useState, useEffect, useRef } from "react";
import { getPosts } from "../../api/posts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import styles from "./MapModal.module.css";

const MapModal = ({ onClose }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const { userId: currentUserId } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        const filtered = data.filter((p) => {
          const hasLocation = p.latitude && p.longitude;
          const isAuthor = String(p.user_id) === String(currentUserId);
          const isLiked = (p.likedBy || []).includes(String(currentUserId));
          const isJoined = (p.joinedUserIds || []).includes(String(currentUserId));

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
        if (!container) return;

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
            const isAuthor = String(post.user_id) === String(currentUserId);

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
    <div className={styles.modalWrapper} onMouseDown={onClose}>
      <div className={styles.modalContent} onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>약속 지도 보기</h2>
          <button className={styles.closeBtn} onClick={onClose}>
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
        </header>

        <div className={styles.mapViewContainer}>
          <div ref={mapRef} className={styles.mapView} id="large-map" />

          <div className={`${styles.sidePanel}${selectedPost ? ` ${styles.isOpen}` : ""}`}>
            {selectedPost ? (
              <div className={styles.postInfoBox}>
                {selectedPost.image && <img className={styles.postImage} src={selectedPost.image} alt="" />}
                <h3 className={styles.postTitle}>{selectedPost.title}</h3>

                <div className={styles.postMeta}>
                  <div className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {selectedPost.place}
                  </div>
                  <div className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {selectedPost.date} {selectedPost.time}
                  </div>
                  <div className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {selectedPost.participants} / {selectedPost.capacity || 2}명 참여중
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <a 
                    className={styles.navBtn}
                    href={`https://map.kakao.com/link/to/${selectedPost.place},${selectedPost.latitude},${selectedPost.longitude}`} 
                    target="_blank"
                    rel="noreferrer"
                  >
                    길찾기 (카카오맵)
                  </a>
                  <button className={styles.detailBtn} onClick={() => {
                    onClose();
                    navigate(`/detail/${selectedPost.id}`);
                  }}>
                    게시글 상세보기
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyPanel}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>마커를 클릭하면<br />약속 정보를 확인할 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
