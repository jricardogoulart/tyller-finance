import { motion } from "framer-motion";

interface StepperProps {
  currentStep: number; // 1-indexed current active step
  totalSteps?: number;
  labels?: string[];
  className?: string;
}

export function Stepper({
  currentStep,
  totalSteps = 3,
  labels = [],
  className = "",
}: StepperProps) {
  // Ensure we have a valid range of steps
  const stepsCount = Math.max(totalSteps, labels.length);
  const stepsArray = Array.from({ length: stepsCount }, (_, i) => i + 1);

  return (
    <div
      className={`w-full flex flex-col items-center gap-4 p-6 rounded-2xl border bg-neutral-900/60 backdrop-blur-md border-neutral-800/80 shadow-md ${className}`}
      style={{
        fontFamily: "var(--font-family-body)",
      }}
    >
      {/* Stepper Steps Row */}
      <div className="relative w-full flex items-center justify-between max-w-lg">
        {/* Connecting Progress Line behind nodes */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-neutral-700/80 -translate-y-1/2 z-0" />
        
        {/* Dynamic Animated Active Progress Fill */}
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] bg-brand-400 -translate-y-1/2 z-0"
          style={{
            originX: 0,
            boxShadow: "0 0 10px rgba(190, 240, 48, 0.6)",
          }}
          initial={{ width: "0%" }}
          animate={{
            width: `${((Math.max(1, Math.min(currentStep, stepsCount)) - 1) / (stepsCount - 1)) * 100}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 25,
          }}
        />

        {/* Steps Nodes */}
        {stepsArray.map((step) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              {/* Step indicator circle */}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-semibold select-none cursor-pointer transition-colors duration-300 ${
                  isActive
                    ? "bg-brand-400 border-brand-400 text-neutral-950"
                    : isCompleted
                    ? "bg-brand-950/40 border-brand-500/50 text-brand-300"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-750"
                }`}
                animate={
                  isActive
                    ? {
                        scale: 1.1,
                        boxShadow: [
                          "0 0 8px rgba(190, 240, 48, 0.3)",
                          "0 0 18px rgba(190, 240, 48, 0.65)",
                          "0 0 8px rgba(190, 240, 48, 0.3)",
                        ],
                      }
                    : isCompleted
                    ? {
                        scale: 1,
                        boxShadow: [
                          "0 0 4px rgba(190, 240, 48, 0.15), inset 0 0 4px rgba(190, 240, 48, 0.05)",
                          "0 0 12px rgba(190, 240, 48, 0.4), inset 0 0 8px rgba(190, 240, 48, 0.15)",
                          "0 0 4px rgba(190, 240, 48, 0.15), inset 0 0 4px rgba(190, 240, 48, 0.05)",
                        ],
                      }
                    : { scale: 1, boxShadow: "none" }
                }
                transition={{
                  scale: { type: "spring", stiffness: 120, damping: 15 },
                  boxShadow: {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  },
                }}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[2.5] fill-none stroke-current">
                    <motion.path
                      d="M20 6L9 17L4 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 15,
                        delay: 0.1,
                      }}
                    />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </motion.div>

              {/* Sub-label under circle */}
              {labels[step - 1] && (
                <span
                  className={`absolute top-12 whitespace-nowrap text-2xs uppercase tracking-wider font-semibold transition-colors duration-300 ${
                    isActive
                      ? "text-brand-400 font-bold"
                      : isCompleted
                      ? "text-neutral-200"
                      : "text-neutral-400"
                  }`}
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                  }}
                >
                  {labels[step - 1]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stepper;
