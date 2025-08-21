"use client";
import { useEffect, useRef, useState } from "react";
import useCarStream from "../hooks/useCarStream";

export default function MapView({ carId = "car-001" }) {
  const { lastPoint } = useCarStream(carId);

  const [naverMap, setNaverMap] = useState(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const pathRef = useRef([]);

  // 맵 초기화 (최초 1회)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function init(lat, lng) {
      const map = new naver.maps.Map("naverMap", {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15,
        zoomControl: true,
        zoomControlOptions: { style: naver.maps.ZoomControlStyle.SMALL, position: naver.maps.Position.TOP_RIGHT }
      });
      setNaverMap(map);

      markerRef.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        icon: { content: '<div style="background:#FF0000;width:20px;height:20px;border-radius:50%;border:2px solid #fff;"></div>', anchor: new naver.maps.Point(10,10) }
      });

      polylineRef.current = new naver.maps.Polyline({
        map, path: [], strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 4
      });
    }

    if (!window.naver?.maps) {
      const script = document.createElement("script");
      script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=vybj2787v3"; // 본인 키
      script.async = true;
      script.onload = () => init(37.4979, 127.0276);
      document.head.appendChild(script);
    } else {
      init(37.4979, 127.0276);
    }
  }, []);

  // 실시간 포인트 들어올 때마다 지도 갱신
  useEffect(() => {
    if (!naverMap || !lastPoint) return;
    const { lat, lng } = lastPoint;
    const ll = new naver.maps.LatLng(lat, lng);

    pathRef.current.push(ll);
    polylineRef.current?.setPath([...pathRef.current]);
    markerRef.current?.setPosition(ll);

    // 5포인트마다 한번만 중심 이동(너무 흔들리는 것 방지)
    if (pathRef.current.length % 5 === 0) naverMap.setCenter(ll);
  }, [lastPoint, naverMap]);

  return (
    <div style={{ width: "100rem", padding: "1rem" }}>
      <div id="naverMap" style={{ width: "100%", height: "80vh", borderRadius: 12, border: "1px solid #ddd" }} />
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {lastPoint ? `lat ${lastPoint.lat}, lng ${lastPoint.lng}, v ${lastPoint.speedKmh}km/h` : "waiting..."}
      </div>
    </div>
  );
}
