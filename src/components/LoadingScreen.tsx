"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("rf_intro_seen")) {
        return;
      }
    } catch {
      // If sessionStorage is unavailable, proceed normally
    }

    setIsVisible(true);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem("rf_intro_seen", "1");
      } catch {}
    }, 1100);

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
              duration: 0.65,
              ease: [0.32, 0.72, 0, 1],
            },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden border-b border-soft-border shadow-2xl"
          style={{
            background: "radial-gradient(circle at center, #11141a 0%, #08090b 80%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0.2, y: -30, transition: { duration: 0.35 } }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col items-center px-4 text-center"
          >
            {/* Minimal Brand Flag Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5 text-[#E53935] text-xl font-bold shadow-lg shadow-black/40"
            >
              ⚑
            </motion.div>

            {/* Logo */}
            <div className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground font-sans">
              <span className="text-[#E53935]">Red</span>Flaggers
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-3 text-xs sm:text-sm text-secondary font-medium tracking-wide"
            >
              Recognize the <span className="text-[#E53935] font-semibold">red</span> flags
              <span className="text-[#E53935] font-bold">.</span>
            </motion.p>

            {/* Subtle Minimalist Indicator Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 48, opacity: 0.4 }}
              transition={{
                duration: 0.6,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-[1.5px] bg-gradient-to-r from-transparent via-[#E53935] to-transparent mt-5 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
