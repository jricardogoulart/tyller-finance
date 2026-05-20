import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center flex-wrap gap-2 text-2xs uppercase tracking-widest select-none ${className}`}
      style={{
        fontFamily: "var(--font-family-mono)",
        color: "var(--color-neutral-400)",
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* Divider */}
            {index > 0 && (
              <span className="text-neutral-600 font-normal">/</span>
            )}

            {/* Clickable Link or Active Label */}
            {item.onClick && !isLast ? (
              <motion.button
                onClick={item.onClick}
                className="hover:text-brand-400 font-semibold transition-colors cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {item.label}
              </motion.button>
            ) : (
              <span
                className={`font-semibold ${
                  isLast ? "text-brand-300 font-bold" : "text-neutral-400"
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
