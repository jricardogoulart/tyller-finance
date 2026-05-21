import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface UploadCardProps {
  onParsed: (data: { transactions: any[]; fileHash: string; filename: string }) => void;
  onError: (error: string) => void;
  className?: string;
}

export function UploadCard({ onParsed, onError, className = "" }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'ofx' && extension !== 'pdf') {
      onError('Apenas arquivos no formato .OFX ou .PDF são permitidos.');
      return;
    }

    setLoading(true);
    onError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/transactions/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.duplicate) {
        const confirmImport = window.confirm(
          `⚠️ Extrato Duplicado Detectado\n\n` +
            `Este extrato parece idêntico ao arquivo "${response.data.filename}" enviado anteriormente.\n\n` +
            `Deseja importar mesmo assim?\n\n` +
            `Clique "OK" para importar ou "Cancelar" para descartar.`
        );
        if (!confirmImport) {
          return;
        }
      }

      if (response.data?.transactions && response.data?.fileHash) {
        onParsed({
          transactions: response.data.transactions,
          fileHash: response.data.fileHash,
          filename: file.name,
        });
      }
    } catch (err: any) {
      console.error(err);
      onError(err.response?.data?.error || 'Erro ao processar o extrato. Verifique a estrutura do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (loading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerSelect = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      whileHover={loading ? {} : { scale: 1.005 }}
      whileTap={loading ? {} : { scale: 0.995 }}
      onHoverStart={() => !loading && setIsHovered(true)}
      onHoverEnd={() => !loading && setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerSelect}
      className={`relative w-full rounded-2xl border p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden noise ${className}`}
      style={{
        backgroundColor: isDragging 
          ? 'rgba(190, 240, 48, 0.03)' 
          : isHovered 
            ? 'var(--color-neutral-850)' 
            : 'var(--color-neutral-900)',
        borderColor: isDragging 
          ? 'var(--color-brand-400)' 
          : isHovered 
            ? 'var(--color-brand-700)' 
            : 'var(--color-neutral-800)',
        boxShadow: isDragging 
          ? 'var(--shadow-glow)' 
          : isHovered 
            ? '0 0 16px rgba(168, 217, 24, 0.1)' 
            : 'var(--shadow-md)',
        minHeight: '220px',
      }}
    >
      {/* Dynamic Shimmer and Border Glow */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 shimmer pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Dragging Sweep Line */}
      {isDragging && (
        <motion.div
          initial={{ top: "-100%" }}
          animate={{ top: "200%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-brand-400), transparent)",
            boxShadow: "0 0 8px var(--color-brand-400)",
          }}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".ofx,.pdf"
        className="hidden"
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-10 h-10 rounded-full border-t-2"
            style={{
              borderColor: 'var(--color-brand-400)',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-neutral-400)',
            }}
          >
            Analisando extrato e extraindo transações...
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-4 z-10 select-none">
          {/* Animated icon indicator */}
          <motion.div
            animate={isDragging ? { y: -5 } : { y: 0 }}
            transition={{ repeat: isDragging ? Infinity : 0, repeatType: "reverse", duration: 0.6 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: isDragging ? 'var(--color-brand-950)' : 'var(--color-neutral-850)',
              borderColor: isDragging ? 'var(--color-brand-500)' : 'var(--color-neutral-750)',
              color: isDragging ? 'var(--color-brand-400)' : 'var(--color-neutral-400)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.div>

          <div className="flex flex-col gap-1">
            <span
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-md)',
                fontWeight: 'var(--font-weight-semibold)' as any,
                color: 'var(--color-neutral-100)',
              }}
            >
              {isDragging ? 'Solte para importar o extrato!' : 'Importar Extrato Bancário'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-neutral-400)',
                maxWidth: '300px',
              }}
            >
              Arraste seu arquivo <b style={{ color: 'var(--color-brand-400)' }}>.OFX</b> ou <b style={{ color: 'var(--color-brand-400)' }}>.PDF</b> para cá, ou clique para navegar
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--font-size-2xs)',
              color: 'var(--color-neutral-600)',
              letterSpacing: 'var(--letter-spacing-wider)',
              textTransform: 'uppercase',
            }}
          >
            Formato oficial Itaú, Nubank, Bradesco, etc.
          </span>
        </div>
      )}
    </motion.div>
  );
}
