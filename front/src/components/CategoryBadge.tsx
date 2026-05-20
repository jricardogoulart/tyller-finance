import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryStyle, CATEGORIES_LIST } from '../utils/categories';

interface CategoryBadgeProps {
  category: string;
  transactionId: string;
  onUpdate: (newCategory: string) => Promise<void>;
  categoriesList?: string[];
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, transactionId: _transactionId, onUpdate, categoriesList }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const style = getCategoryStyle(category);
  const listToRender = categoriesList || CATEGORIES_LIST;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCategory = async (newCat: string) => {
    if (newCat === category) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(newCat);
    } catch (err) {
      console.error('Failed to update category:', err);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        type="button"
        disabled={isUpdating}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 rounded-full border text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all focus:outline-none"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          borderColor: style.border,
          cursor: isUpdating ? 'wait' : 'pointer',
          fontFamily: 'var(--font-family-body)',
        }}
      >
        {isUpdating ? (
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
        )}
        <span>{style.label}</span>
        
        {/* Subtle Chevron indicator */}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 mt-2 w-48 rounded-2xl border shadow-xl z-50 overflow-hidden"
            style={{
              backgroundColor: "rgba(17, 17, 17, 0.95)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div className="p-1 flex flex-col gap-0.5 max-h-64 overflow-y-auto">
              <span className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-neutral-500 block border-b border-white/5 mb-1">
                Alterar Categoria
              </span>
              
              {listToRender.map((cat) => {
                const isSelected = cat === category;
                const catStyle = getCategoryStyle(cat);
                
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors hover:bg-white/5"
                    style={{
                      color: isSelected ? catStyle.text : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catStyle.text }} />
                      <span>{cat}</span>
                    </div>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
              
              {/* Opção para criar nova categoria personalizada */}
              <div className="mt-1.5 pt-1.5 border-t border-white/5 px-2.5 pb-2 flex flex-col gap-1.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-500 block">Nova Categoria</span>
                <input
                  type="text"
                  placeholder="Digitar e pressionar Enter..."
                  className="w-full px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-brand-500/50 focus:bg-neutral-950 transition-colors"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        await handleSelectCategory(val);
                      }
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
