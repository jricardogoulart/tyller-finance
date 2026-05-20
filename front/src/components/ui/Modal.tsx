import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolation-isolate">
          {/* 1. Backdrop Overlay (GPU composited blur + dim fade) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/75 backdrop-blur-md cursor-pointer"
          />

          {/* 2. Dialog Container (Spring animated scale & fade) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 25,
            }}
            className={`relative w-full max-w-md bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-2xl z-10 ${className}`}
            style={{
              fontFamily: "var(--font-family-body)",
            }}
          >
            {/* Header section */}
            <div className="flex items-center justify-between mb-4">
              {title ? (
                <h3
                  className="font-bold text-base text-neutral-100 tracking-tight"
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {title}
                </h3>
              ) : (
                <div />
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="text-sm text-neutral-300 leading-relaxed">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
