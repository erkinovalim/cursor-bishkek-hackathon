"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { hours, minutes, seconds, expired: false };
}

export function CountdownTimer({ endsAt }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    formatRemaining(new Date(endsAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const tick = () =>
      setRemaining(formatRemaining(new Date(endsAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (remaining.expired) {
    return <span className="badge-pill badge-peach text-xs">Day ended</span>;
  }

  return (
    <span className="badge-pill badge-mint text-xs tabular-nums">
      <span className="opacity-70">Ends</span>
      {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
    </span>
  );
}
