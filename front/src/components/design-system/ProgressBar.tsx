import { motion } from 'framer-motion';

export function ProgressBar({
  value,
  delay = 0.1,
}: {
  value: number;
  delay?: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="ds-progress-track">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, delay }}
        className="ds-progress-fill"
      />
    </div>
  );
}
