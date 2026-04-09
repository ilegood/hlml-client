/**
 * window.onload는 페이지의 모든 요소(이미지, 스크립트 등)가
 * 완전히 로드된 후 실행됩니다.
 */
window.onload = function () {
  // 1. 카카오맵 객체 확인
  if (window.kakao && window.kakao.maps) {
    // autoload=false를 사용했으므로 kakao.maps.load 콜백을 사용해야 합니다.
    kakao.maps.load(function () {
      const mapContainer = document.getElementById("map"); // 지도를 표시할 div
      const mapOptions = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      };

      // 지도 생성 및 객체 리턴
      const map = new kakao.maps.Map(mapContainer, mapOptions);

      console.log("카카오맵이 성공적으로 로드되었습니다!");
    });
  } else {
    console.error(
      "카카오 API 스크립트가 로드되지 않았습니다. 앱키와 도메인 설정을 확인하세요.",
    );
  }

  // 2. 버튼 클릭 이벤트 리스너 등록
  const reserveBtn = document.getElementById("reserveBtn");
  const routeBtn = document.getElementById("routeBtn");

  if (reserveBtn) {
    reserveBtn.addEventListener("click", function () {
      alert("예약하기 버튼이 작동합니다!");
    });
  }

  if (routeBtn) {
    routeBtn.addEventListener("click", function () {
      alert("길찾기 버튼이 작동합니다!");
    });
  }
};
