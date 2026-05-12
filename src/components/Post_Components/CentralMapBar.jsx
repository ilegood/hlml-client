import { useState, useEffect, useRef } from "react";
import MapModal from "../modals/MapModal";
import { useAuth } from "../../context/auth";
import { getPosts } from "../../api/posts";
import styles from "./CentralMapBar.module.css";

const CentralMapBar = () => {
  const { token, userId: currentUserId } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (token && window.kakao && window.kakao.maps && mapRef.current) {
      const fetchAndDraw = async () => {
        try {
          const data = await getPosts();
          const filtered = data.filter((p) => {
            const hasLocation = p.latitude && p.longitude;
            const isAuthor = String(p.user_id) === String(currentUserId);
            const isLiked = (p.likedBy || []).includes(String(currentUserId));
            const isJoined = (p.joinedUserIds || []).includes(String(currentUserId));
            return hasLocation && (isAuthor || isLiked || isJoined);
          });

          const container = mapRef.current;
          if (!container) return;

          window.kakao.maps.load(() => {
            const options = {
              center: new window.kakao.maps.LatLng(37.5665, 126.978),
              level: 4,
            };
            const map = new window.kakao.maps.Map(container, options);
            const bounds = new window.kakao.maps.LatLngBounds();
            let hasPoints = false;

            filtered.forEach((post) => {
              const lat = Number(post.latitude);
              const lng = Number(post.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                const position = new window.kakao.maps.LatLng(lat, lng);
                const isAuthor = String(post.user_id) === String(currentUserId);

                let markerImage = null;
                if (isAuthor) {
                  const imageSrc =
                    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
                  const imageSize = new window.kakao.maps.Size(20, 30);
                  markerImage = new window.kakao.maps.MarkerImage(
                    imageSrc,
                    imageSize,
                  );
                }

                new window.kakao.maps.Marker({
                  position: position,
                  map: map,
                  image: markerImage,
                });
                bounds.extend(position);
                hasPoints = true;
              }
            });

            if (hasPoints) {
              map.setBounds(bounds);
            }

            map.setDraggable(false);
            map.setZoomable(false);
          });
        } catch (err) {
          console.error("Preview map error:", err);
        }
      };

      const timer = setTimeout(fetchAndDraw, 100);
      return () => clearTimeout(timer);
    }
  }, [token, currentUserId]);

  if (!token) return null;

  return (
    <>
      <div className={styles.mapBarContainer} onClick={() => setIsMapOpen(true)}>
        <div ref={mapRef} className={styles.mapPreviewArea} />
      </div>
      {isMapOpen && <MapModal onClose={() => setIsMapOpen(false)} />}
    </>
  );
};

export default CentralMapBar;
