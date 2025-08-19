import { useEffect, useState, useRef } from "react";
import { usePlayback } from "../../hooks/usePlayback";
import PlaybackControls from "../../pages/car-tracking/PlaybackControls";

export default function CarTrackingPage() {
  const [track, setTrack] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [naverMap, setNaverMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const { index, isPlaying, play, pause, reset } = usePlayback(track?.points, { speed });

  useEffect(() => {
    // 정적 파일에서 더미 데이터 로드(백엔드/서버 불필요)
    fetch("/data/car-tracking/tracks.sample.json")
      .then(r => r.json())
      .then(setTrack)
      .catch(console.error);
  }, []);

    // 네이버 지도 초기화
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 네이버 지도 API가 이미 로드되어 있으면 바로 초기화
    if (window.naver?.maps) {
      initNaverMap();
      return;
    }

    // 네이버 지도 API 로드
    const script = document.createElement("script");
    script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=vybj2787v3";
    script.async = true;
    script.onload = () => {
      initNaverMap();
    };
    document.head.appendChild(script);

    function initNaverMap() {
      // 기본 좌표 (첫 번째 포인트가 있으면 사용, 없으면 서울시청)
      const defaultLat = track?.points?.[0]?.lat ?? 37.566826;
      const defaultLng = track?.points?.[0]?.lng ?? 126.9786567;
      
      const mapOptions = {
        center: new naver.maps.LatLng(defaultLat, defaultLng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: {
          style: naver.maps.ZoomControlStyle.SMALL,
          position: naver.maps.Position.TOP_RIGHT
        }
      };
      
      const map = new naver.maps.Map('naverMap', mapOptions);
      setNaverMap(map);
      
      // 초기 마커 생성
      const initialMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(defaultLat, defaultLng),
        map: map,
        icon: {
          content: '<div style="background-color: #FF0000; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
          anchor: new naver.maps.Point(10, 10)
        }
      });
      setMarker(initialMarker);
      
      // 경로가 있으면 폴리라인 그리기
      if (track?.points?.length > 1) {
        const path = track.points.map(p => new naver.maps.LatLng(p.lat, p.lng));
        const newPolyline = new naver.maps.Polyline({
          map: map,
          path: path,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 4
        });
        setPolyline(newPolyline);
      }
    }
  }, [track]);

  // 현재 인덱스가 변경될 때 마커 위치 업데이트
  useEffect(() => {
    if (!naverMap || !marker || !track?.points?.[index]) return;
    
    const { lat, lng } = track.points[index];
    const newPosition = new naver.maps.LatLng(lat, lng);
    
    // 마커 위치 변경
    marker.setPosition(newPosition);
    
    // 지도 중심 이동
    naverMap.setCenter(newPosition);
  }, [index, track, naverMap, marker]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Car Tracking - Naver Map</h1>
      
      {/* 네이버 지도 */}
      <div style={{ marginBottom: 20 }}>
        <div id="naverMap" style={{ width: "100%", height: "70vh", borderRadius: 12, border: "1px solid #ddd" }}></div>
      </div>
      
      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        speed={speed}
        setSpeed={setSpeed}
      />
      
      <div style={{ marginTop: 16, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
        {track?.points?.[index] ? (
          <>
            <div><b>Vehicle ID:</b> {track.vehicleId}</div>
            <div><b>Time:</b> {new Date(track.points[index].ts).toLocaleString()}</div>
            <div><b>Latitude:</b> {track.points[index].lat}</div>
            <div><b>Longitude:</b> {track.points[index].lng}</div>
            <div><b>Progress:</b> {index + 1} / {track.points.length}</div>
          </>
        ) : (
          <div>Loading tracking data...</div>
        )}
      </div>
    </div>
  );
}
