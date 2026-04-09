"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("")
  const targetText = "BYTE"
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  
  useEffect(() => {
    let iteration = 0
    let interval: NodeJS.Timeout

    const startAnimation = () => {
      interval = setInterval(() => {
        setText(prev => 
          targetText
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return targetText[index]
              }
              return characters[Math.floor(Math.random() * characters.length)]
            })
            .join("")
        )

        if (iteration >= targetText.length) {
          clearInterval(interval)
          setTimeout(onComplete, 500) // Hold briefly before exit
        }

        iteration += 0.2 // Slower iteration to resolve letters
      }, 80) // Slower interval for randomness
    }

    const timeout = setTimeout(startAnimation, 300)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.2 } }} // Fade out container at end
    >
      {/* Background that shrinks to match hero modal */}
      <motion.div
        className="absolute bg-black"
        initial={{ inset: 0, borderRadius: 0 }}
        exit={{ 
          top: "1rem", 
          left: "1rem", 
          right: "1rem", 
          bottom: "1rem", 
          borderRadius: "2.5rem",
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } // Custom easing
        }}
      />

      {/* Text that fades out independently */}
      <motion.h1
        className="relative z-10 text-6xl sm:text-8xl md:text-9xl font-bold text-white tracking-widest font-sans"
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
      >
        {text}
      </motion.h1>
    </motion.div>
  )
}
