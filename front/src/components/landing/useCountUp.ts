import { useState, useRef, useEffect } from "react";

/**
 * ScrollTriggered count-up animation.
 * Fires once when the ref element enters the viewport.
 * Uses easeOutCubic for natural deceleration.
 *
 * @param target  - Final numeric value to count up to
 * @param duration - Animation duration in ms (default 1500)
 */
export function useCountUp(target: number, duration = 1500) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setVal(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { val, ref };
}
