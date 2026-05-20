import { motion } from "framer-motion";
import React from "react";

interface NavLinkProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({
  href = "#",
  onClick,
  active = false,
  children,
  className = "",
}: NavLinkProps) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors select-none ${className}`}
      style={{
        fontFamily: "var(--font-family-body)",
        color: active ? "var(--color-brand-400)" : "var(--color-neutral-400)",
        backgroundColor: active ? "rgba(210, 250, 100, 0.08)" : "transparent",
        border: active ? "1px solid rgba(210, 250, 100, 0.15)" : "1px solid transparent",
      }}
      whileHover={{
        scale: 1.05,
        color: "var(--color-brand-400)",
        backgroundColor: "rgba(210, 250, 100, 0.04)",
        borderColor: "rgba(210, 250, 100, 0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 25,
      }}
    >
      {/* Decorative Glow dot or hover background indicator */}
      {active && (
        <motion.span
          layoutId="navActiveGlow"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(210,250,100,0.8)]"
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 25,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
