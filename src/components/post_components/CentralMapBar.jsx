import { useState, useRef } from "react";
import MapModal from "../modals/MapModal";
import { useAuth } from "../../context/auth";
import styles from "./CentralMapBar.module.css";
import { useKakaoMap } from "../../hooks/useKakaoMap"; // Import the custom hook

const CentralMapBar = () => {
  const { token, userId: currentUserId } = useAuth();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const mapRef = useRef(null);

  // Use the custom hook to handle Kakao Map logic
  useKakaoMap(mapRef, token, currentUserId);

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
