import { useEffect, useRef, useState } from "react";

export function usePlayback(points, { speed = 1 } = {}) {
  const [isPlaying, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  useEffect(() => {
    clearInterval(timer.current);
    if (!isPlaying || !points?.length) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i < points.length - 1 ? i + 1 : i));
    }, 1000 / speed);
    return () => clearInterval(timer.current);
  }, [isPlaying, points, speed]);

  return {
    index, isPlaying,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    reset: () => { setPlaying(false); setIndex(0); }
  };
}
