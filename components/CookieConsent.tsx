"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import {
  ADVERTISING_ENABLED,
  GOOGLE_ADS_ENABLED,
  META_PIXEL_ENABLED,
  getConsentSnapshot,
  getServerConsentSnapshot,
  onOpenCookiePreferences,
  parseConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";
import { bootGoogleAds, trackGoogleAdsLead } from "@/lib/google-ads";
import { adEventForHref, bootAdvertising, trackAdEvent } from "@/lib/meta-pixel";
import styles from "./CookieConsent.module.css";

// Aviso de cookies e eventos de anúncio da landing. Quem liga e desliga o Meta Pixel e a tag do
// Google Ads a partir da escolha salva são lib/meta-pixel.ts e lib/google-ads.ts. Os CTAs continuam <a> estáticos: um único listener
// no documento manda Lead (cadastro) e Contact (WhatsApp) quando são clicados; o Lead também
// vira a conversão secundária do Google Ads.
export default function CookieConsent() {
  const raw = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [reaberto, setReaberto] = useState(false);
  const titleId = useId();

  useEffect(() => {
    bootAdvertising();
    bootGoogleAds();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const adEvent = adEventForHref(link.href);
      if (adEvent) trackAdEvent(adEvent, { content_name: link.closest("[id]")?.id ?? "barra-fixa" });
      if (adEvent === "Lead") trackGoogleAdsLead();
    };
    document.addEventListener("click", onClick);
    const offOpen = onOpenCookiePreferences(() => setReaberto(true));
    return () => {
      document.removeEventListener("click", onClick);
      offOpen();
    };
  }, []);

  // Sem Pixel nem Google Ads não há aviso; no servidor e na hidratação a escolha ainda é desconhecida.
  if (!ADVERTISING_ENABLED || raw === undefined) return null;
  if (parseConsent(raw) && !reaberto) return null;

  function decidir(aceitou: boolean) {
    saveConsent(aceitou);
    setReaberto(false);
  }

  return (
    <section aria-labelledby={titleId} className={styles.aviso}>
      <h2 id={titleId} className={styles.titulo}>
        Podemos usar cookies?
      </h2>
      <p className={styles.texto}>
        Só usamos cookies de publicidade se você permitir. {advertisingPurpose()} Detalhes na <a href="https://fidz.com.br/privacidade">Política de Privacidade</a>.
      </p>
      <div className={styles.acoes}>
        <button type="button" onClick={() => decidir(false)} className={styles.rejeitar}>
          Rejeitar
        </button>
        <button type="button" onClick={() => decidir(true)} className={styles.aceitar}>
          Aceitar
        </button>
      </div>
    </section>
  );
}

function advertisingPurpose(): string {
  if (META_PIXEL_ENABLED && GOOGLE_ADS_ENABLED) {
    return "Eles servem para mostrar anúncios da Fidz no Facebook, no Instagram e no Google e medir o resultado deles (Meta Pixel e Google Ads, com servidores nos Estados Unidos).";
  }
  if (GOOGLE_ADS_ENABLED) {
    return "Eles servem para mostrar anúncios da Fidz no Google e medir o resultado deles (Google Ads, com servidores nos Estados Unidos).";
  }
  return "Eles servem para mostrar anúncios da Fidz no Facebook e no Instagram e medir o resultado deles (Meta Pixel, com servidores nos Estados Unidos).";
}
