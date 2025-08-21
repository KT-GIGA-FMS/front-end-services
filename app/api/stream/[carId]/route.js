export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Node 런타임에서 스트리밍

// ===== 공통 유틸 =====
const toRad = (d) => (d * Math.PI) / 180;
function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
const lerp = (a, b, t) => a + (b - a) * t;
const lerpCoord = ([x1, y1], [x2, y2], t) => [lerp(x1, x2, t), lerp(y1, y2, t)];
const randBetween = (min, max) => min + Math.random() * (max - min);

// 샘플 경로(polyline) — 필요하면 public 데이터로 교체 가능
const ROUTES = [
  [[127.0276,37.4979],[127.0288,37.4988],[127.0301,37.4998],[127.0315,37.5012],[127.0330,37.5020]],
  [[126.9780,37.5665],[126.9795,37.5670],[126.9810,37.5678],[126.9828,37.5684],[126.9842,37.5693]]
];

// ===== direct 모드: 좌표 직접 생성하여 SSE 전송 =====
function makeDirectStream(carId) {
  const encoder = new TextEncoder();
  // 각 연결마다 독립 경로 재생기
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  let seg = 0, t = 0, speed = randBetween(25, 55); // km/h
  let fuel = randBetween(40, 95);
  const TICK_MS = 1000;

  return new ReadableStream({
    start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // 초기 한 프레임(센터 잡기 용)
      const [lng0, lat0] = route[0];
      send({ carId, tripId: `trip-${Date.now()}-${carId}`, ts: Date.now(), lat: lat0, lng: lng0, speedKmh: 0, heading: 0, fuel: +fuel.toFixed(2) });

      const timer = setInterval(() => {
        // 속도/연료 갱신
        speed = Math.max(0, Math.min(80, speed + randBetween(-3, 3)));
        fuel = Math.max(0, fuel - randBetween(0.002, 0.01));

        // 이동 계산
        const a = route[seg];
        const b = route[seg + 1] || route[0];
        const segLen = haversineMeters(a, b);
        let move = (speed * 1000 / 3600) * (TICK_MS / 1000); // m

        while (move > 0) {
          const left = (1 - t) * segLen;
          if (move < left) { t += move / segLen; move = 0; }
          else { move -= left; seg = (seg + 1) % (route.length - 1); t = 0; }
        }

        const [lng, lat] = lerpCoord(a, b, t);
        const heading = 0; // 간단화. 필요하면 bearing 계산 로직 추가 가능
        send({
          carId,
          tripId: `trip-live-${carId}`,
          ts: Date.now(),
          lat: +lat.toFixed(6),
          lng: +lng.toFixed(6),
          speedKmh: Math.round(speed),
          heading,
          fuel: +fuel.toFixed(2)
        });
      }, TICK_MS);

      // 연결 종료시 정리
      const close = () => { clearInterval(timer); controller.close(); };
      // Next.js의 req.signal로 abort 감지되는 환경도 있어 참고
      // request.signal?.addEventListener("abort", close); // (이 파일 범위 밖이라 생략)
    }
  });
}

// ===== proxy 모드: 게이트웨이에 프록시 =====
async function proxyStream(carId) {
  const base = process.env.STREAM_GATEWAY_BASE;
  if (!base) return new Response("STREAM_GATEWAY_BASE is not set", { status: 500 });

  const url = `${base.replace(/\/+$/, "")}/stream/${carId}`;
  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return new Response("Upstream unavailable", { status: 502 });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

export async function GET(_req, { params }) {
  const carId = params?.carId || "car-001";
  const mode = (process.env.STREAM_MODE || "direct").toLowerCase();

  if (mode === "proxy") {
    return proxyStream(carId);
  }

  // direct
  const stream = makeDirectStream(carId);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
