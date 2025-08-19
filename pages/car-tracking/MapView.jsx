// pages/car-tracking/MapView.jsx
import { useEffect, useState, useRef } from "react";

export default function MapView({ points, currentIndex }) {
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);

  // 기본 좌표 (강남역)
  const defaultLat = points?.[0]?.lat ?? 37.4979;
  const defaultLng = points?.[0]?.lng ?? 127.0276;

  useEffect(() => {
    // 서버사이드 렌더링 방지
    if (typeof window === "undefined") return;
    
    // 카카오맵 SDK가 이미 로드되어 있으면 바로 초기화
    if (window.kakao?.maps) {
      initMap();
      return;
    }

    // 카카오맵 SDK 로드
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(initMap);
    };
    document.head.appendChild(script);

    function initMap() {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(defaultLat, defaultLng),
        level: 4,
        zoomControl: false,
        draggable: true,
        scrollwheel: true,
        keyboardShortcuts: false,
        disableDoubleClick: false,
        disableDoubleClickZoom: false,
      };
      
      const newMap = new kakao.maps.Map(container, options);
      setMap(newMap);

      // 초기 마커 생성
      const markerPosition = new kakao.maps.LatLng(defaultLat, defaultLng);
      markerRef.current = new kakao.maps.Marker({
        position: markerPosition
      });
      markerRef.current.setMap(newMap);

      // 경로가 있으면 폴리라인 그리기
      if (points?.length > 1) {
        const path = points.map(p => new kakao.maps.LatLng(p.lat, p.lng));
        polylineRef.current = new kakao.maps.Polyline({
          path: path,
          strokeWeight: 4,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeStyle: 'solid'
        });
        polylineRef.current.setMap(newMap);
      }
    }
  }, [points?.length]);

  // 현재 인덱스가 변경될 때 마커 위치 업데이트
  useEffect(() => {
    if (!map || !markerRef.current || !points?.[currentIndex]) return;
    
    const { lat, lng } = points[currentIndex];
    const newPosition = new kakao.maps.LatLng(lat, lng);
    
    // 마커 위치 변경
    markerRef.current.setPosition(newPosition);
    
    // 지도 중심 이동
    map.setCenter(newPosition);
  }, [currentIndex, points, map]);

  return <div id="map" style={{ width: "100%", height: "60vh", borderRadius: 12 }} />;
}