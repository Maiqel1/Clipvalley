"use client";

import * as React from "react";
import { relativeTime } from "@/lib/relative-time";

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {relativeTime(iso, now)}
    </time>
  );
}
