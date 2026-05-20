import { motion } from "framer-motion";
import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-neutral-800/80 bg-neutral-900/20 backdrop-blur-sm ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-800/80 bg-neutral-950/45">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="p-4 text-2xs uppercase tracking-widest font-semibold text-neutral-400 font-mono"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/30 text-xs text-neutral-300">
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <motion.tr
      onClick={onClick}
      className={`hover:bg-neutral-800/25 transition-colors duration-250 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      whileHover={onClick ? { x: 2 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`p-4 align-middle transition-colors ${className}`}>
      {children}
    </td>
  );
}
export default Table;
