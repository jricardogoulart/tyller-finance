import React from "react";
import { motion } from "framer-motion";
import TyllerComplete from "./TyllerComplete";
import { NavLink } from "../ui/NavLink";

interface NavbarProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function Navbar({
  currentRoute = "app",
  onNavigate,
  className = "",
}: NavbarProps) {
  const navItems = [
    { label: "Inicio",      route: "app" },
    { label: "Transações",  route: "user-space" },
    { label: "Perfil",      route: "perfil" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b bg-neutral-950/80 backdrop-blur-md border-neutral-900 ${className}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-16">
        {/* Brand — wordmark only (mascot reserved for emphasis contexts) */}
        <motion.div
          whileHover={{ scale: 1.04, opacity: 0.9 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
          className="cursor-pointer"
          onClick={() => onNavigate?.("app")}
        >
          <TyllerComplete size="2xl" style={{ color: "var(--color-neutral-100)", display: "block" }} />
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.route}
              active={currentRoute === item.route}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.route);
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Status badge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-mono text-neutral-500">Conectado</span>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
