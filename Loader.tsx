import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CuteCharacter } from "./CuteCharacter";

export function SplashLoader({ onComplete }: { onComplete?: () => void }) {
  const letters = ["C", "R", "Y", "O", "V", "A"];
  const [activeLetter, setActiveLetter] = useState(0);

  useEffect(() => {
    // Total 10 seconds -> 6 letters -> ~1666ms per letter
    const interval = setInterval(() => {
      setActiveLetter(prev => {
        if (prev < letters.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 10000 / letters.length);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeLetter === letters.length) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [activeLetter, letters.length, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#FAFAFA] overflow-hidden relative">
      <div className="relative flex items-center justify-center h-32 w-[300px]">
        {/* Letters container */}
        <div className="flex gap-4 absolute z-0 top-10">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="text-6xl font-black text-[#141414] tracking-tighter"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ 
                opacity: index < activeLetter ? 1 : 0,
                y: index < activeLetter ? 0 : 20,
                scale: index < activeLetter ? 1 : 0.8
              }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Character building the letters */}
        <motion.div
          className="absolute z-10 bottom-0"
          initial={{ x: -120 }}
          animate={{ x: activeLetter < letters.length ? -120 + (activeLetter * 48) : 180 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        >
          <CuteCharacter size="md" isWalking={activeLetter < letters.length} />
        </motion.div>
      </div>
      <div className="mt-12 flex flex-col items-center gap-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#141414]">
          {activeLetter < letters.length ? "Building CRYOVA..." : "Ready to launch!"}
        </p>
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-[#A855F7]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min((activeLetter / letters.length) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

export function WalkingLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-6">
      <CuteCharacter size="md" isWalking={true} />
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#141414]">Warming up</p>
        <div className="flex gap-1">
          <motion.div className="w-1 h-1 rounded-full bg-gray-300" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
          <motion.div className="w-1 h-1 rounded-full bg-gray-300" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
          <motion.div className="w-1 h-1 rounded-full bg-gray-300" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
        </div>
      </div>
    </div>
  );
}
