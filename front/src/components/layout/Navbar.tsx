import React from "react";
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
            <TyllerComplete className="h-16 w-auto" />
          </div>
  
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
