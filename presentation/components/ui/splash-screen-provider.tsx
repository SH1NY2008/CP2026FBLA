
"use client";

import { useState, useEffect } from "react";
import { ParticleTextEffect } from "./particle-text-effect";

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); // 6 seconds — matches 3 words × ~2s each

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <ParticleTextEffect
          words={["HELLO", "READY", "BOOST"]}
          msPerWord={2000}
          loopWords={false}
        />
      </div>
    );
  }

  return <>{children}</>;
}
