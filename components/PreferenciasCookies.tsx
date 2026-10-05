"use client";

import { ADVERTISING_ENABLED, openCookiePreferences } from "@/lib/consent";

// Link do rodapé que reabre o aviso de cookies. Sem Pixel não há escolha a mudar.
export default function PreferenciasCookies({ className }: { className?: string }) {
  if (!ADVERTISING_ENABLED) return null;
  return (
    <button type="button" className={className} onClick={() => openCookiePreferences()}>
      Preferências de cookies
    </button>
  );
}
