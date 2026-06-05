"use client";

import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  maxWidth?: number;
  onClose: () => void;
  children: React.ReactNode;
};

export function AdminModal({
  isOpen,
  title,
  maxWidth = 480,
  onClose,
  children
}: Props): JSX.Element | null {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 id="admin-modal-title" className="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
