"use client";

import { useEffect, useRef, useState } from "react";

type CounterProps = {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
};

export function Counter({ to, duration = 1400, suffix = "", prefix = "" }: CounterProps): JSX.Element {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || started) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            setStarted(true);
            const startTime = performance.now();
            const ease = (t: number) => 1 - Math.pow(1 - t, 3);
            const step = (now: number) => {
              const progress = Math.min((now - startTime) / duration, 1);
              const v = ease(progress) * to;
              setValue(Number.isInteger(to) ? Math.floor(v) : Number(v.toFixed(1)));
              if (progress < 1) requestAnimationFrame(step);
              else setValue(to);
            };
            requestAnimationFrame(step);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration, started]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
