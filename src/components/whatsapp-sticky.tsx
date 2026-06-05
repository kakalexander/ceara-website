"use client";

import { useSettings } from "@/components/settings-context";

export function WhatsAppSticky(): JSX.Element {
  const { whatsapp_primary: whatsapp } = useSettings();
  return (
    <a
      className="wpp-sticky"
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5zM12 20.2a8.3 8.3 0 01-4.2-1.2l-.3-.2-3 .9.9-2.9-.2-.3a8.3 8.3 0 1110.5 3.7zm4.6-6.2c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.1-.5 0a6.8 6.8 0 01-2-1.2 7.6 7.6 0 01-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.4.2-.4a.5.5 0 000-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-1 2.3 5.2 5.2 0 001.1 2.7 12 12 0 004.6 4 5.4 5.4 0 003.3.7 2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1 0-.2 0-.3-.1z" />
      </svg>
    </a>
  );
}
