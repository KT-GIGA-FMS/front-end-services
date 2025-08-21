const { createClient } = require("redis");
const routes = require("./routes-seoul.json");

// ===== env =====
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const CARS = (process.env.CARS || "car-001,car-002").split(",");
const TICK_MS = Number(process.env.TICK_MS || 1000);
const MAXLEN = Number(process.env.MAXLEN || 5000);

// ===== utils =====
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
function bearingDeg([lng1, lat1], [lng2, lat2]) {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpCoord([lng1, lat1], [lng2, lat2], t) {
  return [lerp(lng1, lng2, t), lerp(lat1, lat2, t)];
}
function randBetween(min, max) { return min + Math.random() * (max - min); }
function jitterMeters([lng, lat], meters = 2) {
  const dLat = (meters / 111320) * (Math.random() - 0.5) * 2;
  const dLng = (meters / (111320 * Math.cos(toRad(lat)))) * (Math.random() - 0.5) * 2;
  return [lng + dLng, lat + dLat];
}
function newTripId(carId) {
  return `trip-${new Date().toISOString().replace(/[:.]/g, "")}-${carId}-${Math.floor(Math.random()*1e5)}`;
}

class RoutePlayer {
  constructor(route) {
    this.route = route;
    this.segIndex = 0;
    this.t = 0;
    this.speedKmh = randBetween(25, 55);
  }
  step(distanceMeters) {
    let d = distanceMeters;
    while (d > 0) {
      const a = this.route[this.segIndex];
      const b = this.route[this.segIndex + 1] || this.route[0];
      const segLen = haversineMeters(a, b);
      const remain = (1 - this.t) * segLen;
      if (d < remain) { this.t += d / segLen; d = 0; }
      else {
        d -= remain; this.segIndex = (this.segIndex + 1) % (this.route.length - 1); this.t = 0;
        this.speedKmh = Math.min(70, Math.max(10, this.speedKmh + randBetween(-5, 5)));
      }
    }
    const a = this.route[this.segIndex];
    const b = this.route[this.segIndex + 1] || this.route[0];
    const pos = lerpCoord(a, b, this.t);
    const head = bearingDeg(a, b);
    return { pos, head };
  }
}

(async () => {
  const r = createClient({ url: REDIS_URL });
  r.on("error", (e) => console.error("Redis error", e));
  await r.connect();

  const players = CARS.map((carId) => {
    const route = routes[Math.floor(Math.random() * routes.length)];
    return { carId, tripId: newTripId(carId), fuel: randBetween(40, 95), stoppedLeftMs: 0, player: new RoutePlayer(route) };
  });

  console.log(`[generator] start cars=${CARS.join(",")} tick=${TICK_MS}ms`);

  setInterval(async () => {
    const now = Date.now();
    for (const c of players) {
      if (c.stoppedLeftMs <= 0 && Math.random() < 0.02) {
        c.stoppedLeftMs = Math.floor(randBetween(10, 40) * 1000);
      }

      let lng, lat, heading, speedKmh;
      if (c.stoppedLeftMs > 0) {
        c.stoppedLeftMs -= TICK_MS;
        const route = c.player.route, idx = c.player.segIndex;
        const p = lerpCoord(route[idx], route[idx + 1] || route[0], c.player.t);
        [lng, lat] = jitterMeters(p, 0.8);
        heading = 0; speedKmh = 0;
      } else {
        speedKmh = Math.max(0, Math.min(80, c.player.speedKmh + randBetween(-3, 3)));
        const distance = (speedKmh * 1000 / 3600) * (TICK_MS / 1000);
        const { pos, head } = c.player.step(distance);
        [lng, lat] = jitterMeters(pos, 1.5);
        heading = head;
      }

      c.fuel = Math.max(0, c.fuel - randBetween(0.002, 0.01));
      const payload = {
        carId: c.carId, tripId: c.tripId, ts: now,
        lat, lng, speedKmh, heading: Math.round(heading), fuel: Number(c.fuel.toFixed(2))
      };

      try {
        await r.sendCommand([
          "XADD", `car:stream:${c.carId}`, "MAXLEN", "~", String(MAXLEN),
          "*", "data", JSON.stringify(payload)
        ]);
      } catch (e) { console.error("XADD error", e); }
    }
  }, TICK_MS);
})();
