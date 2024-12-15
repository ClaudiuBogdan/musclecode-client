import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const codeCharacters = "{}[]()<>+-*/=!&|;:~^%#@$_\\1234567890";

interface MatrixCharacterProps {
  char: string;
  index: number;
  columnIndex: number;
  total: number;
}

const MatrixCharacter = ({
  index,
  columnIndex,
  total,
}: MatrixCharacterProps) => {
  const initialChar = useMemo(
    () => codeCharacters[Math.floor(Math.random() * codeCharacters.length)],
    []
  );
  const [currentChar, setCurrentChar] = useState(initialChar);

  useEffect(() => {
    if (Math.random() < 0.4) {
      // 40% chance to be animated
      const interval = setInterval(
        () => {
          if (Math.random() < 0.3) {
            // 30% chance to change on each interval
            setCurrentChar(
              codeCharacters[Math.floor(Math.random() * codeCharacters.length)]
            );
          }
        },
        100 + Math.random() * 200
      ); // Random interval between 100-300ms
      return () => clearInterval(interval);
    }
  }, []);

  const getOpacity = () => {
    const position = index / total;
    if (position < 0.2) return position * 5;
    if (position > 0.8) return (1 - position) * 5;
    return 0.4 + Math.random() * 0.6; // Random opacity between 0.4 and 1
  };

  return (
    <motion.span
      className="text-green-500 font-mono text-sm select-none"
      initial={{ opacity: 0 }}
      animate={{
        opacity: getOpacity(),
        scale: [1, 1 + Math.random() * 0.1, 1], // Random scale between 1 and 1.1
      }}
      transition={{
        duration: 0.4 + Math.random() * 0.4, // Random duration between 0.4 and 0.8s
        repeat: Infinity,
        delay:
          (columnIndex * 0.05 + index * 0.02) * (0.8 + Math.random() * 0.4), // Random delay multiplier
        ease: "easeInOut",
      }}
      style={{
        textShadow: `0 0 ${3 + Math.random() * 4}px rgba(74, 222, 128, ${0.6 + Math.random() * 0.4})`,
        transform: `translateY(${index * (14 + Math.random() * 4)}px)`, // Random spacing
      }}
    >
      {currentChar}
    </motion.span>
  );
};

const MatrixStream = ({ columnIndex }: { columnIndex: number }) => {
  const streamLength = useMemo(() => 8 + Math.floor(Math.random() * 6), []); // Random length between 8-14
  const chars = useMemo(
    () =>
      Array(streamLength)
        .fill(0)
        .map(
          () =>
            codeCharacters[Math.floor(Math.random() * codeCharacters.length)]
        ),
    [streamLength]
  );

  const speed = useMemo(() => 1.5 + Math.random(), []); // Random speed between 1.5-2.5s

  return (
    <motion.div
      className="absolute top-0"
      style={{
        left: `${(columnIndex / 24) * 100}%`,
        width: `${100 / 24}%`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      initial={{ y: -100 }}
      animate={{ y: ["-20%", "120%"] }}
      transition={{
        duration: speed,
        repeat: Infinity,
        delay: columnIndex * (0.1 + Math.random() * 0.1), // Random delay
        ease: "linear",
      }}
    >
      {chars.map((char, i) => (
        <MatrixCharacter
          key={i}
          char={char}
          index={i}
          columnIndex={columnIndex}
          total={streamLength}
        />
      ))}
    </motion.div>
  );
};

export const MatrixRain = () => {
  const phrase = "Running tests...";

  return (
    <div className="relative w-[500px] h-[200px] overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900/5 via-gray-900/20 to-gray-900/5 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent z-10" />

      <div className="absolute inset-0">
        <AnimatePresence>
          {Array(24)
            .fill(0)
            .map((_, i) => (
              <MatrixStream key={i} columnIndex={i} />
            ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="text-green-400 font-mono text-lg px-8 py-4 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: [0.8, 1],
            scale: 1,
            textShadow: [
              "0 0 8px rgba(74, 222, 128, 0.5)",
              "0 0 16px rgba(74, 222, 128, 0.8)",
              "0 0 24px rgba(74, 222, 128, 0.6)",
            ],
          }}
          transition={{
            duration: 0.2,
            textShadow: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {phrase}
        </motion.div>
      </motion.div>
    </div>
  );
};
