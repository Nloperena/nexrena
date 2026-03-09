import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  label: string;
}

function parseNumeric(val: string): { prefix: string; number: number; suffix: string } | null {
  const match = val.match(/^([^0-9]*)([0-9,.]+)([^0-9]*)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, '')),
    suffix: match[3],
  };
}

export default function MetricCounter({ value, label }: Props) {
  const parsed = parseNumeric(value);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parsed) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !parsed) return;

    const target = parsed.number;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started]);

  const displayValue = parsed
    ? `${parsed.prefix}${current.toLocaleString()}${parsed.suffix}`
    : value;

  return (
    <div ref={ref} className="metric-counter">
      <div className="metric-counter__value">{displayValue}</div>
      <div className="metric-counter__label">{label}</div>
    </div>
  );
}
