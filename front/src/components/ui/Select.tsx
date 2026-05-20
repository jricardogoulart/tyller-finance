import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all focus:outline-none bg-neutral-850 border-neutral-700 text-neutral-100 hover:border-neutral-500 cursor-pointer"
        style={{
          fontFamily: "var(--font-family-body)",
        }}
      >
        <span className={selectedOption ? "text-neutral-100" : "text-neutral-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-250 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </motion.button>

      {/* Dropdown Overlay List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, type: "spring", stiffness: 300, damping: 20 }}
            className="absolute left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden"
            style={{
              backgroundColor: "rgba(17, 17, 17, 0.96)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div className="p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors hover:bg-white/5 cursor-pointer"
                    style={{
                      color: isSelected ? "var(--color-brand-400)" : "rgba(255, 255, 255, 0.7)",
                      fontFamily: "var(--font-family-body)",
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Select;
