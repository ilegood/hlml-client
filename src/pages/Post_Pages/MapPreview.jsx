import { useEffect, useRef } from "react";
import styled from "styled-components";

const MapContainer = styled.div`
  width: 764px;
  height: 260px;
  margin: 15px auto;
  background: #f9f9f9;
`;

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
      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      });

      marker.setMap(map);
      map.setDraggable(false);
      map.setZoomable(false);
    });
  }, [latitude, longitude]);

  return <MapContainer ref={mapRef} id="map-preview" />;
};

export default MapPreview;
