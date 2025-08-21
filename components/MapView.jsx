"use client";
import { useEffect, useRef, useState } from "react";
import useCarStream from "../hooks/useCarStream";

export default function MapView({ carId = "CAR002" , maxTrail = 5000 }) {

  

   
// 차량 스트림 데이터 받아오는 부분분
  const { connected, lastPoint, lastTelemetry, getPath, topic  } = useCarStream(carId, {
    byCar: true, throttleMs: 0, maxPath: maxTrail, debug: true,
  });

  useEffect(() => {
    if (lastPoint) {
      console.log("[lastPoint]", lastPoint);
      // 예: console.log("[lastPoint]", lastPoint.lat, lastPoint.lng, lastPoint.speedKmh);
    } else {
      console.log("[lastPoint] waiting…");
    }
  }, [lastPoint]);
  
// 임시메타+ 스트림 값으로 배지 값 구성
const CAR_META = { };
const driverName =
  CAR_META[carId]?.driverName ?? lastTelemetry?.vehicleName ?? "미지정";
const plateNo =
  CAR_META[carId]?.plateNo ?? lastTelemetry?.vehicleId ?? "미지정";
const carMeta = { driverName, plateNo };

  //지도 상태 관리 변수 
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null); 
    const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const pathRef = useRef([]);
//버튼
  /** 🔹 마커 아이콘(HTML) 생성: 위쪽에 배지 형태의 텍스트 버튼 + 아래 빨간 점 */const makeMarkerContent = ({ driverName, plateNo }) => {
  return `
  <div style="position:relative; transform: translate(-50%, -100%);">
    <button
      type="button"
      style="
        position:absolute;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 10px;
        background:#111827;
        color:#fff;
        border:1px solid rgba(0,0,0,0.15);
        border-radius: 9999px;
        font-size:12px;
        line-height:1;
        white-space:nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        cursor: default;
        user-select: none;
      "
      title="${driverName} · ${plateNo}"
    >
      ${driverName} · ${plateNo}
    </button>
    <div
      style="
        width:20px;height:20px;border-radius:50%;
        background:#FF0000;border:2px solid #fff;
        box-shadow: 0 0 0 2px rgba(255,0,0,0.2);
      "
    ></div>
  </div>
`;
};


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
      mapRef.current = map;
      setMapReady(true);

      markerRef.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map,
        icon: {content: makeMarkerContent(carMeta), anchor: new naver.maps.Point(10,10) },title: `${carMeta.driverName} · ${carMeta.plateNo}`, 
      });

      polylineRef.current = new naver.maps.Polyline({
        map, path: [new naver.maps.LatLng(lat, lng)], strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 4
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
  
    // 🔄 carId 변경 시 배지 갱신 (※ 이 훅은 컴포넌트 바디 "안"에 있어야 함)
  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setIcon({
      content: makeMarkerContent(carMeta),
      anchor: new naver.maps.Point(10, 30),
    });
    markerRef.current.setTitle(`${carMeta.driverName} · ${carMeta.plateNo}`);
  }, [carId]); // ← 여기 훅이 컴포넌트 밖으로 나가면 바로 'Invalid hook call' 남


  // 실시간 포인트 들어올 때마다 지도 갱신
  useEffect(() => {
    if (!mapReady || !mapRef.current || !lastPoint) return;
    const { lat, lng } = lastPoint;
    const ll = new naver.maps.LatLng(lat, lng);
  
    pathRef.current.push(ll);
    if (pathRef.current.length > maxTrail) {
      pathRef.current.splice(0, pathRef.current.length - maxTrail);
    }
    polylineRef.current?.setPath(pathRef.current);
    markerRef.current?.setPosition(ll);
  
    if (pathRef.current.length % 5 === 0) mapRef.current.setCenter(ll);
  }, [lastPoint, mapReady, maxTrail]);

  return (
    <div style={{ width: "100rem", padding: "1rem" }}>
      <div id="naverMap" style={{ width: "100%", height: "80vh", borderRadius: 12, border: "1px solid #ddd" }} />
      WS: <b>{connected ? "connected" : "disconnected"}</b>{" · "}
      <div style={{ marginTop: 8, fontSize: 12 }}>
      {lastPoint
        ? `lat ${lastPoint.lat}, lng ${lastPoint.lng}, v ${lastPoint.speedKmh ?? 0}km/h`
        : "waiting..."}
      </div>
    </div>
  );
}
