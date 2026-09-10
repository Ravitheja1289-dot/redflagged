"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lock scroll while the rolling screen is active
    document.body.style.overflow = "hidden";

    // Display duration before physical rolling screen transition
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  const handleExitComplete = () => {
    document.body.style.overflow = "";
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: {
              duration: 0.85,
              ease: [0.32, 0.72, 0, 1]
            }
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden border-b border-soft-border shadow-2xl"
          style={{
            background: "radial-gradient(circle at center, #0F0F0F 0%, #000000 80%)"
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0.3, y: -40, transition: { duration: 0.4 } }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="flex flex-col items-center"
          >
            {/* Logo matching homepage and header typography */}
            <div className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground font-sans">
              <span className="text-[#E53935]">Red</span>Flaggers
            </div>

            {/* Tagline Quote with Red Accents */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="mt-4 text-sm sm:text-base md:text-lg text-secondary font-medium tracking-wide text-center px-6"
            >
              Recognize the <span className="text-[#E53935] font-semibold">red</span> flags
              <span className="text-[#E53935] font-bold">.</span>
            </motion.p>

            {/* Subtle Minimalist Indicator Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 64, opacity: 0.35 }}
              transition={{
                duration: 0.8,
                delay: 0.35,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent mt-6 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
