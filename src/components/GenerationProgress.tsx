import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface GenerationProgressProps {
  progressTitle?: string;
  isGenerating: boolean;
}

const steps = [
  { label: "Menyiapkan workspace materi...", progress: 10, time: 0 },
  { label: "Menghubungkan ke Google Drive...", progress: 30, time: 500 },
  { label: "Mengekstraksi teks dari file & link...", progress: 50, time: 2000 },
  { label: "Menganalisis konteks pedagogis...", progress: 75, time: 4000 },
  { label: "Gemini sedang mengkomposisi soal...", progress: 95, time: 6000 },
];

export function GenerationProgress({ isGenerating, progressTitle = "Mensintesis Data" }: GenerationProgressProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIdx(0);
      return;
    }

    const timers = steps.map((step, idx) => {
      // Don't set initial step timer, it's already at index 0. Only when time > 0.
      if (step.time > 0) {
        return setTimeout(() => {
          setCurrentStepIdx(idx);
        }, step.time);
      }
      return null;
    });

    return () => {
      timers.forEach(t => t && clearTimeout(t));
    };
  }, [isGenerating]);

  const currentStep = steps[currentStepIdx];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 text-xs font-medium text-gray-500">
        <span className="truncate pr-4">{currentStep.label}</span>
        <span className="shrink-0">{currentStep.progress}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <motion.div
          className="h-full bg-accent rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${currentStep.progress}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-white/20 animate-move-stripes" 
               style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
