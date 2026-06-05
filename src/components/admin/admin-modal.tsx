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
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label="Fechar modal"
            style={{ marginLeft: "auto", padding: "4px 8px", fontSize: "1.2rem", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
      </div>
    </div>
  );
}
