import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string | number;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  className = "",
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string | number, boolean>>({});

  const toggleItem = (id: string | number) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      } else {
        // Close others, toggle current
        const next: Record<string | number, boolean> = {};
        if (!prev[id]) {
          next[id] = true;
        }
        return next;
      }
    });
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {items.map((item) => {
        const isOpen = !!openIds[item.id];

        return (
          <div
            key={item.id}
            className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300"
            style={{
              borderColor: isOpen ? "var(--color-brand-600)" : "var(--color-neutral-800)",
              boxShadow: isOpen ? "0 0 12px rgba(190, 240, 48, 0.08)" : "none",
            }}
          >
            {/* Header Trigger */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-neutral-800/20 transition-colors"
            >
              <span
                className="text-sm font-semibold tracking-tight transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-family-body)",
                  color: isOpen ? "var(--color-brand-400)" : "var(--color-neutral-100)",
                }}
              >
                {item.title}
              </span>
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-neutral-400"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Expandable Body Panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 18 }}
                >
                  <div className="p-4 pt-0 border-t border-neutral-850/60 text-xs text-neutral-300 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
