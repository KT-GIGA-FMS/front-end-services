'use client';

import { useEffect, useState } from "react";

export default function MapView({ points = [] }) {
  const [naverMap, setNaverMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [track, setTrack] = useState([]);   // 초기 track 상태
  const [index, setIndex] = useState(0);    // 현재 이동 인덱스

  // 기본 좌표 (강남역)
  const defaultLat = points?.[0]?.lat ?? 37.4979;
  const defaultLng = points?.[0]?.lng ?? 127.0276;

  // 정적 JSON에서 데이터 로드
  useEffect(() => {
    fetch("/data/car-tracking/tracks.sample.json")
      .then(r => r.json())
      .then(setTrack)
      .catch(console.error);
  }, []);

  // 네이버 지도 초기화
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 네이버 지도 API 스크립트 동적 로드
    if (!window.naver?.maps) {
      const script = document.createElement("script");
      script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=vybj2787v3";// pages/car-tracking/MapView.jsx
      script.async = true;
      script.onload = () => initNaverMap();
      document.head.appendChild(script);
    } else {
      initNaverMap();
    }

    function initNaverMap() {
      const initLat = track?.points?.[0]?.lat ?? defaultLat;
      const initLng = track?.points?.[0]?.lng ?? defaultLng;

      const mapOptions = {
        center: new naver.maps.LatLng(initLat, initLng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: {
          style: naver.maps.ZoomControlStyle.SMALL,
          position: naver.maps.Position.TOP_RIGHT
        }
      };

      const map = new naver.maps.Map('naverMap', mapOptions);
      setNaverMap(map);

      // 초기 마커
      const initialMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(initLat, initLng),
        map,
        icon: {
          content: '<div style="background-color: #FF0000; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
          anchor: new naver.maps.Point(10, 10)
        }
      });
      setMarker(initialMarker);

      // 경로 폴리라인
      if (track?.points?.length > 1) {
        const path = track.points.map(p => new naver.maps.LatLng(p.lat, p.lng));
        const newPolyline = new naver.maps.Polyline({
          map,
          path,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 4
        });
        setPolyline(newPolyline);
      }
    }
  }, [track]);

  // 인덱스 변화 → 마커 이동
  useEffect(() => {
    if (!naverMap || !marker || !track?.points?.[index]) return;

    const { lat, lng } = track.points[index];
    const newPosition = new naver.maps.LatLng(lat, lng);

    marker.setPosition(newPosition);
    naverMap.setCenter(newPosition);
  }, [index, track, naverMap, marker]);

  return (
    <div style={{width: "100rem",padding: "1rem"}}>
      <div>
        <div
          id="naverMap"
          style={{ width: "100%", height: "80vh", borderRadius: 12, border: "1px solid #ddd" }}
        />
      </div>

      {/* 임시 버튼으로 이동 테스트 */}
      {/* <button onClick={() => setIndex((prev) => (prev + 1) % (track?.points?.length || 1))}>
        Move Next Point
      </button> */}
    </div>
  );
}
