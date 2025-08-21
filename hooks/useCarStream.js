"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function num(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}
function parseTs(ts) {
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const m = Date.parse(ts); // "YYYY-MM-DDTHH:mm:ss.SSS" → 로컬 시간 기준 파싱
    if (!Number.isNaN(m)) return m;
  }
  return Date.now();
}

/**
 * useCarStream
 * @param {string|null} carId  차량ID (차량별 토픽을 구독하려면 필수)
 * @param {object} opts
 *   - sockUrl: SockJS HTTP 엔드포인트 (기본 .env의 NEXT_PUBLIC_SOCKJS_HTTP)
 *   - byCar: true면 /topic/telemetry.{carId}, false면 /topic/telemetry
 *   - throttleMs: 포인트 업데이트 최소 간격(ms)
 *   - maxPath: 경로 최대 길이
 *   - topicOverride: 커스텀 토픽을 직접 주고 싶을 때
 *   - appPublishDest: 서버로 publish할 목적지 (기본 "/app/telemetry")
 */
export default function useCarStream(carId, opts = {}) {
  const {
    sockUrl = process.env.NEXT_PUBLIC_SOCKJS_HTTP || "",
    byCar = true,
    throttleMs = 200,
    maxPath = 5000,
    topicOverride,
    appPublishDest = "/app/telemetry",
    debug: debugOption = false,
  } = opts;

  const debugFn =
    typeof debugOption === "function"
        ? debugOption
        : debugOption
        ? (m) => console.log("[STOMP]", m)
        : () => {};
// 진단용: 현재 설정 출력
useEffect(() => {
    console.log("[CFG] sockUrl:", sockUrl, "byCar:", byCar, "carId:", carId);
    }, [sockUrl, byCar, carId]);

  const [connected, setConnected] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [lastTelemetry, setLastTelemetry] = useState(null);

  const clientRef = useRef(null);
  const subRef = useRef(null);
  const pathRef = useRef([]);
  const lastEmitRef = useRef(0);

  // 구독 토픽 결정
  const topic =
    topicOverride ||
    (byCar && carId ? `/topic/telemetry.${carId}` : `/topic/telemetry`);

  // 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(sockUrl),
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: debugFn,
      onConnect: (frame) => {
      console.log("[WS] CONNECTED", frame?.headers);
          setConnected(true);
        },
        onWebSocketClose: (e) => {
          console.log("[WS] CLOSE", e?.code, e?.reason);
          setConnected(false);
        },
      onWebSocketClose: () => setConnected(false),
      onStompError: (f) =>
        console.error("STOMP error:", f.headers?.["message"], f.body),
    });

    client.activate();
    clientRef.current = client;
    return () => {
        client.deactivate();
        clientRef.current = null;
    }
    // sockUrl만 연결 조건
  }, [sockUrl, debugOption]);

  // 구독/해제
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

  // 2) 기존 구독이 있다면 해제 (topic/carId/throttle 등 변경 시 중복 구독 방지)
    subRef.current?.unsubscribe();
    console.log("[WS] SUB", topic);    

    subRef.current = client.subscribe(topic, (msg) => {
      if (!msg?.body)  console.log("[WS][RX]", topic, msg.body);
    //   return;
      let raw;
      try {
        raw = JSON.parse(msg.body);
      } catch {
        return;
      }

      // 백엔드 스키마 매핑
      const lat = num(raw.latitude ?? raw.lat, NaN);
      const lng = num(raw.longitude ?? raw.lng, NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const telem = {
        id: raw.id ?? null,
        vehicleId: raw.vehicleId ?? carId ?? null,
        vehicleName: raw.vehicleName ?? null,
        latitude: lat,
        longitude: lng,
        speed: num(raw.speed, 0),
        heading: num(raw.heading, null),
        status: raw.status ?? null,
        timestamp: raw.timestamp ?? raw.ts ?? null, // 원문 그대로도 보관
        ts: parseTs(raw.timestamp ?? raw.ts),
        fuelLevel: num(raw.fuelLevel, null),
        engineStatus: raw.engineStatus ?? null,
        _raw: raw,
      };

      // 스로틀
      const now = Date.now();
      if (now - lastEmitRef.current < throttleMs) return; 
      lastEmitRef.current = now;

      // 경로 저장
      const point = {
        lat,
        lng,
        ts: telem.ts,
        speedKmh: telem.speed,
        heading: telem.heading,
      };

      //경로 버퍼 누적 및 메모리보호호
      pathRef.current.push(point);
      if (pathRef.current.length > maxPath) {
        pathRef.current.splice(0, pathRef.current.length - maxPath);
      }
      //최종상태 갱신신
      setLastTelemetry(telem);
      setLastPoint(point);
    });

    // cleanup on re-subscribe
    return () => subRef.current?.unsubscribe();
  }, [topic, carId, throttleMs, maxPath, connected]);

  // 서버로 테스트 발행(선택)
  const publish = (payload) => {
    const c = clientRef.current;
    if (!c?.connected) return;
    c.publish({
      destination: appPublishDest,
      body: JSON.stringify(payload),
    });
  };

  return {
    connected,
    lastPoint,
    lastTelemetry,
    getPath: () => pathRef.current.slice(),
    clearPath: () => {
      pathRef.current = [];
      setLastPoint(null);
    },
    publish,
  };
}