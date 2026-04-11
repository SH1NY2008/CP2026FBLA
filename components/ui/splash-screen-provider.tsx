
"use client";

import { useState, useEffect } from "react";
import { ParticleTextEffect } from "./particle-text-effect";

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <ParticleTextEffect />
      </div>
    );
  }

  return <>{children}</>;
}
