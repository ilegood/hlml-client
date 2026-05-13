import { useEffect, useRef } from "react";
import styles from "./MapPreview.module.css";

const MapPreview = ({ latitude, longitude }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !latitude || !longitude) return;

    window.kakao.maps.load(() => {
      const container = mapRef.current;
      if (!container) return;
      
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
    });
  }, [latitude, longitude]);

  return <div ref={mapRef} className={styles.mapContainer} id="map-preview" />;
};

export default MapPreview;
