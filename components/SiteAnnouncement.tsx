"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthCard } from "@/components/AuthCard";

export function SiteAnnouncement() {
  const [visible, setVisible] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || isSignedIn) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 5500);
    return () => window.clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isSignedIn) return null;

  if (!visible) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#2E2E2E]/55 px-4 py-10 backdrop-blur">
      <div className="auth-modal-scroll w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[40px]">
        <AuthCard initialVariant="login" />
      </div>
    </div>
  );
}
