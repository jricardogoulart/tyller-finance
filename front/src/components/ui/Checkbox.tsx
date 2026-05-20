import { motion } from "framer-motion";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  disabled = false,
}: CheckboxProps) {
  return (
    <motion.label
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={{
        fontFamily: "var(--font-family-body)",
        fontSize: "var(--font-size-sm)",
      }}
      whileHover={disabled ? {} : { scale: 1.02, x: 1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
        
        {/* Animated Checkbox Border and Backdrop */}
        <motion.div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-250 ${
            checked
              ? "bg-brand-950/40 border-brand-400 text-brand-400"
              : "bg-neutral-850 border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-transparent"
          }`}
          animate={
            checked
              ? {
                  boxShadow: [
                    "0 0 6px rgba(190, 240, 48, 0.2), inset 0 0 4px rgba(190, 240, 48, 0.1)",
                    "0 0 16px rgba(190, 240, 48, 0.6), inset 0 0 8px rgba(190, 240, 48, 0.2)",
                    "0 0 6px rgba(190, 240, 48, 0.2), inset 0 0 4px rgba(190, 240, 48, 0.1)",
                  ],
                }
              : { boxShadow: "none" }
          }
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        >
          {checked && (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-[3.5] fill-none stroke-current">
              <motion.path
                d="M20 6L9 17L4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 15,
                  delay: 0.05,
                }}
              />
            </svg>
          )}
        </motion.div>
      </div>

      {label && (
        <span
          className={`font-medium transition-colors duration-200 ${
            checked ? "text-brand-400 font-semibold" : "text-neutral-300"
          }`}
        >
          {label}
        </span>
      )}
    </motion.label>
  );
}

export default Checkbox;
