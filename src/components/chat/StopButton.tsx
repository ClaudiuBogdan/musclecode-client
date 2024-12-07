import React from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StopButtonProps {
  onStop: () => void;
}

export const StopButton: React.FC<StopButtonProps> = ({ onStop }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 right-0 mx-auto -top-12 w-fit"
    >
      <Button
        onClick={onStop}
        variant="secondary"
        size="sm"
        className="shadow-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
      >
        <Square className="h-4 w-4 mr-2" />
        Stop generating
      </Button>
    </motion.div>
  );
};
