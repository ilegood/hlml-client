import { useEffect, useRef } from "react";
import styled from "styled-components";

const MapContainer = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 3px solid #07b1bc;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 15px auto;
  background: #f9f9f9;
`;

const MapPreview = ({ latitude, longitude }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !latitude || !longitude) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 마커 표시
    const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
    });
    marker.setMap(map);

    // 상호작용 비활성화 (미리보기 용도)
    map.setDraggable(false);
    map.setZoomable(false);
  }, [latitude, longitude]);

  return <MapContainer ref={mapRef} id="map-preview" />;
};

export default MapPreview;
