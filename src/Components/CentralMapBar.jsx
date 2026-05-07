import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import MapModal from "./MapModal";
import { useAuth } from "../context/AuthContext";
import { getPosts } from "../api/posts";

const MapBarContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto 24px auto;
  background: var(--color-sidebar);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--color-active);
  }

  &::after {
    content: "약속 지도에서 확인하기";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(7, 177, 188, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 800;
    z-index: 10;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    transition: background 0.2s;
  }

  &:hover::after {
    background: var(--color-active);
  }
`;

const MapPreviewArea = styled.div`
  height: 140px;
  width: 100%;
  background: #eee;
  opacity: 0.7;
`;

const CentralMapBar = () => {
  const { token, name: currentUserId } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (token && window.kakao && window.kakao.maps && mapRef.current) {
      const fetchAndDraw = async () => {
        try {
          const data = await getPosts();
          const filtered = data.filter((p) => {
            const hasLocation = p.latitude && p.longitude;
            const isAuthor = p.author === currentUserId;
            const isLiked = (p.likedBy || []).includes(currentUserId);
            const isJoined = (p.joinedBy || []).includes(currentUserId);
            return hasLocation && (isAuthor || isLiked || isJoined);
          });

          const container = mapRef.current;
          if (!container) return;

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
              const isAuthor = post.author === currentUserId;

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
      <MapBarContainer onClick={() => setIsMapOpen(true)}>
        <MapPreviewArea ref={mapRef} />
      </MapBarContainer>
      {isMapOpen && <MapModal onClose={() => setIsMapOpen(false)} />}
    </>
  );
};

export default CentralMapBar;
