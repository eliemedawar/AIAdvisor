import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disableBackdropClose?: boolean;
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', disableBackdropClose }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={disableBackdropClose ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${maxW} z-10 rounded-2xl p-6`}
            style={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-center justify-between mb-6">
              {title && <h2 className="font-semibold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>}
              <button onClick={onClose} className="ml-auto p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#fff')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>{children}</div>
            {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
