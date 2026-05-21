import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  inset?: boolean;
  motionProps?: HTMLMotionProps<'div'>;
};

export function GlassCard({ children, className = '', inset = false, motionProps }: GlassCardProps) {
  const base = inset ? 'ds-card-inset' : 'ds-glass-card';
  const classes = `${base} ${className}`.trim();

  if (motionProps) {
    return (
      <motion.div {...motionProps} className={classes}>
        {children}
      </motion.div>
    );
  }

  return <div className={classes}>{children}</div>;
}
