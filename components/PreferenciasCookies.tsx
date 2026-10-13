"use client";

import { CONSENT_ENABLED, openCookiePreferences } from "@/lib/consent";

// Link do rodapé que reabre o aviso de cookies. Sem PostHog, Pixel nem Google Ads não há escolha a mudar.
export default function PreferenciasCookies({ className }: { className?: string }) {
  if (!CONSENT_ENABLED) return null;
  return (
    <button type="button" className={className} onClick={() => openCookiePreferences()}>
      Preferências de cookies
    </button>
  );
}
