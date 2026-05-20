import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type AlertVariant = "success" | "warning" | "error" | "info";

interface AlertProps {
  title?: string;
  description: string;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
  visible?: boolean;
}

const variantStyles: Record<
  AlertVariant,
  { bg: string; border: string; text: string; iconColor: string; icon: React.ComponentType<any> }
> = {
  success: {
    bg: "rgba(5, 46, 22, 0.4)",
    border: "rgba(21, 128, 61, 0.3)",
    text: "var(--color-success-100)",
    iconColor: "var(--color-success-500)",
    icon: CheckCircle2,
  },
  warning: {
    bg: "rgba(69, 26, 3, 0.4)",
    border: "rgba(180, 83, 9, 0.3)",
    text: "var(--color-warning-100)",
    iconColor: "var(--color-warning-500)",
    icon: AlertTriangle,
  },
  error: {
    bg: "rgba(69, 10, 10, 0.4)",
    border: "rgba(185, 28, 28, 0.3)",
    text: "var(--color-error-100)",
    iconColor: "var(--color-error-500)",
    icon: XCircle,
  },
  info: {
    bg: "rgba(23, 37, 84, 0.4)",
    border: "rgba(29, 78, 216, 0.3)",
    text: "var(--color-info-100)",
    iconColor: "var(--color-info-500)",
    icon: Info,
  },
};

export function Alert({
  title,
  description,
  variant = "info",
  onClose,
  className = "",
  visible = true,
}: AlertProps) {
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm shadow-sm relative overflow-hidden ${className}`}
          style={{
            backgroundColor: styles.bg,
            borderColor: styles.border,
            color: styles.text,
            fontFamily: "var(--font-family-body)",
          }}
        >
          {/* Accent light highlight border */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
            style={{ backgroundColor: styles.iconColor }}
          />

          {/* Alert Icon */}
          <div className="flex-shrink-0 mt-0.5" style={{ color: styles.iconColor }}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col gap-0.5">
            {title && (
              <span className="text-sm font-semibold tracking-tight">
                {title}
              </span>
            )}
            <p className="text-xs leading-relaxed opacity-85">{description}</p>
          </div>

          {/* Close Action Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Alert;
