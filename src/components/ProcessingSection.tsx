import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProcessingSectionProps {
  loadingStep: number;
  loadingMessages: string[];
}

export const ProcessingSection: React.FC<ProcessingSectionProps> = ({
  loadingStep,
  loadingMessages
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="py-20 flex flex-col items-center justify-center gap-8"
    role="status"
    aria-live="polite"
    aria-label="Processing medical data"
  >
    <div className="relative">
      <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 animate-[spin_10s_linear_infinite]" />
      <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin" size={32} />
    </div>
    <div className="text-center space-y-2">
      <p className="text-white font-mono text-xs uppercase tracking-widest">
        {loadingMessages[loadingStep]}
      </p>
      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
        <motion.div 
          className="h-full bg-white"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 12.5, ease: "linear" }}
        />
      </div>
    </div>
  </motion.div>
);
