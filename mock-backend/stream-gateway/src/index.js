const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");

const PORT = Number(process.env.PORT || 8080);
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);

async function main() {
  const app = express();

  // CORS (개발 단계: 허용 폭 넓게)
  app.use(cors({
    origin: (origin, cb) => cb(null, true), // 필요 시 CORS_ORIGINS 체크로 좁히세요
    credentials: false
  }));

  app.get("/health", (_, res) => res.json({ ok: true }));

  const redis = createClient({ url: REDIS_URL });
  redis.on("error", (e) => console.error("Redis error", e));
  await redis.connect();

  app.get("/stream/:carId", async (req, res) => {
    const carId = req.params.carId;
    const streamKey = `car:stream:${carId}`;

    // SSE 헤더
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let closed = false;
    req.on("close", () => { closed = true; });

    let lastId = "$"; // 현재 마지막 이후부터
    // 주기적 하트비트(일부 프록시/브라우저 타임아웃 방지)
    const heartbeat = setInterval(() => { if (!closed) res.write(`: ping\n\n`); }, 15000);

    try {
      while (!closed) {
        const data = await redis.xRead(
          { key: streamKey, id: lastId },
          { BLOCK: 15000, COUNT: 10 }
        );

        if (!data) {
          // 블록 타임아웃 → 하트비트가 대신 감
          continue;
        }

        for (const [, entries] of data) {
          for (const [id, fields] of entries) {
            lastId = id;
            // 필드 "data" 로 JSON 문자열이 들어 있음
            res.write(`data: ${fields.data}\n\n`);
          }
        }
      }
    } catch (e) {
      // 연결 중 에러
      console.error("stream error", e);
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  });

  app.listen(PORT, () => console.log(`[gateway] listening on ${PORT}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
