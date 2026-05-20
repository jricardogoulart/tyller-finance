import React from "react";
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
  // Navigation mapping:
  // "Inicio" -> "app"
  // "Transações" -> "user-space" (or "transactions" if isolated)
  // "Perfil" -> "perfil" (or user-space/profile)
  const navItems = [
    { label: "Inicio", route: "app" },
    { label: "Transações", route: "user-space" },
    { label: "Perfil", route: "perfil" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b bg-neutral-950/80 backdrop-blur-md border-neutral-900 ${className}`}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-16">
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-400">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.3" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.7" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-neutral-100)",
                letterSpacing: "var(--letter-spacing-tight)",
              }}
            >
              TyllerFinance
            </span>
          </div>
          <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-mono text-brand-500 bg-brand-950 border border-brand-800">
            v1.0.0
          </span>
        </div>

        {/* Navigation Links using NavLink */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.route}
              active={currentRoute === item.route}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) {
                  onNavigate(item.route);
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Optional Action / Status Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-mono text-neutral-500">Conectado</span>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
