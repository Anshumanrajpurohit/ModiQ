"use client";

import { useEffect, useState } from "react";
import { AuthCard } from "@/components/AuthCard";

export function SiteAnnouncement() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 5500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#2E2E2E]/45 backdrop-blur"
      onClick={() => setVisible(false)}
    >
      <div className="w-[min(520px,94vw)]" onClick={(event) => event.stopPropagation()}>
        <AuthCard variant="login" />
      </div>
    </div>
  );
}
