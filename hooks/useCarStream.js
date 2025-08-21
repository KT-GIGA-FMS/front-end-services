"use client";

import { useEffect, useRef, useState } from "react";

/** /api/stream/:carId SSE 구독 훅 */
export default function useCarStream(carId) {
  const [lastPoint, setLastPoint] = useState(null);
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    if (!carId) return;
    const es = new EventSource(`/api/stream/${encodeURIComponent(carId)}`);
    esRef.current = es;
    es.onmessage = (e) => {
      try { setLastPoint(JSON.parse(e.data)); } catch {}
    };
    es.onerror = (e) => setError(e);
    return () => es.close();
  }, [carId]);

  return { lastPoint, error };
}
