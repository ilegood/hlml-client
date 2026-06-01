import { useEffect } from "react";
import { getMyChatRooms } from "../api/posts";

export const useKakaoMap = (mapRef, token, currentUserId) => {
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let retryTimer = null;

    const drawMap = async () => {
      if (cancelled) return;

      if (!window.kakao?.maps || !mapRef.current) {
        retryTimer = window.setTimeout(drawMap, 100);
        return;
      }

      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 7,
      };

      const map = new window.kakao.maps.Map(container, options);
      map.setDraggable(false);
      map.setZoomable(false);

      try {
        const data = await getMyChatRooms();
        if (cancelled) return;

        const filtered = data.filter((p) => p.latitude && p.longitude);

        window.kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;

          const bounds = new window.kakao.maps.LatLngBounds();
          let hasPoints = false;

          filtered.forEach((post) => {
            const lat = Number(post.latitude);
            const lng = Number(post.longitude);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
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
                position,
                map,
                image: markerImage,
              });
              bounds.extend(position);
              hasPoints = true;
            }
          });

          if (hasPoints) {
            map.setBounds(bounds);
          }
        });
      } catch (err) {
        console.error("Preview map error:", err);
      }
    };

    drawMap();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [mapRef, token, currentUserId]);
};
