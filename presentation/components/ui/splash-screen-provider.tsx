
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ParticleTextEffect } from "./particle-text-effect";

const GOOGLE_LETTERS = [
  { char: "G", color: "#4285F4" },
  { char: "o", color: "#EA4335" },
  { char: "o", color: "#FBBC05" },
  { char: "g", color: "#4285F4" },
  { char: "l", color: "#34A853" },
  { char: "e", color: "#EA4335" },
];

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"intro" | "credit" | "done">("intro");

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setPhase("credit");
    }, 6000); // 6 seconds — matches 3 words × ~2s each

    const creditTimer = setTimeout(() => {
      setPhase("done");
    }, 8400); // Hold the "Powered by Places API" credit briefly.

    return () => {
      clearTimeout(introTimer);
      clearTimeout(creditTimer);
    };
  }, []);

  if (phase !== "done") {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "intro" ? (
            <motion.div
              key="intro"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.45 } }}
            >
              <ParticleTextEffect
                words={["HELLO", "READY", "BOOST"]}
                msPerWord={2000}
                loopWords={false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="credit"
              className="relative flex flex-col items-center justify-center gap-3 px-6 text-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            >
              <motion.p
                className="text-white/65 text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.26em]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.35 } }}
              >
                Powered by Places API
              </motion.p>

              <motion.p
                className="text-5xl sm:text-6xl md:text-7xl font-medium leading-none tracking-tight"
                style={{ fontFamily: "'Product Sans', 'Google Sans', Arial, sans-serif" }}
                aria-label="Google"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.045,
                      delayChildren: 0.12,
                    },
                  },
                }}
              >
                {GOOGLE_LETTERS.map((letter, index) => (
                  <motion.span
                    key={`${letter.char}-${index}`}
                    style={{ color: letter.color }}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {letter.char}
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
}
