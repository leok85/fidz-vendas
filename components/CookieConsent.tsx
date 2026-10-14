"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { bootMeasurement, trackCtaClick } from "@/lib/analytics";
import {
  ADVERTISING_ENABLED,
  CONSENT_ENABLED,
  GOOGLE_ADS_ENABLED,
  MEASUREMENT_ENABLED,
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

// Aviso de cookies e eventos dos CTAs da landing. Quem liga e desliga o PostHog, o Meta Pixel e a tag
// do Google Ads a partir da escolha salva são lib/analytics.ts, lib/meta-pixel.ts e lib/google-ads.ts.
// Os CTAs continuam <a> estáticos: um único listener no documento manda o cta_clicked do PostHog e o
// Lead (cadastro) ou Contact (WhatsApp) do Meta quando são clicados; o Lead também vira a conversão
// secundária do Google Ads.
export default function CookieConsent() {
  const raw = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [reaberto, setReaberto] = useState(false);
  const titleId = useId();

  useEffect(() => {
    bootMeasurement();
    bootAdvertising();
    bootGoogleAds();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const adEvent = adEventForHref(link.href);
      if (!adEvent) return;
      const location = link.closest("[id]")?.id ?? "barra-fixa";
      trackCtaClick(location, adEvent === "Lead" ? "cadastro" : "whatsapp");
      trackAdEvent(adEvent, { content_name: location });
      if (adEvent === "Lead") trackGoogleAdsLead(event, link);
    };
    document.addEventListener("click", onClick);
    const offOpen = onOpenCookiePreferences(() => setReaberto(true));
    return () => {
      document.removeEventListener("click", onClick);
      offOpen();
    };
  }, []);

  // Sem PostHog, Pixel nem Google Ads não há aviso; no servidor e na hidratação a escolha ainda é
  // desconhecida.
  if (!CONSENT_ENABLED || raw === undefined) return null;
  if (parseConsent(raw) && !reaberto) return null;

  function decidir(aceitou: boolean) {
    saveConsent({ measurement: aceitou, advertising: aceitou });
    setReaberto(false);
  }

  return (
    <section aria-labelledby={titleId} className={styles.aviso}>
      <h2 id={titleId} className={styles.titulo}>
        Podemos usar cookies?
      </h2>
      {/* No celular vai a versão curta, para o aviso não cobrir metade da tela; o detalhe fica na
          Política. */}
      <p className={`${styles.texto} ${styles.textoLongo}`}>
        Só usamos cookies de {cookieKinds()} se você permitir. {purpose()} Detalhes na <a href="https://fidz.com.br/privacidade">Política de Privacidade</a>.
      </p>
      <p className={`${styles.texto} ${styles.textoCurto}`}>
        Só com a sua permissão: {shortPurpose()}. Detalhes na <a href="https://fidz.com.br/privacidade">Política de Privacidade</a>.
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

function cookieKinds(): string {
  if (MEASUREMENT_ENABLED && ADVERTISING_ENABLED) return "medição e de publicidade";
  return MEASUREMENT_ENABLED ? "medição" : "publicidade";
}

function shortPurpose(): string {
  const uses: string[] = [];
  if (MEASUREMENT_ENABLED) uses.push("medição desta página");
  if (META_PIXEL_ENABLED && GOOGLE_ADS_ENABLED) uses.push("anúncios da Fidz no Facebook, no Instagram e no Google");
  else if (GOOGLE_ADS_ENABLED) uses.push("anúncios da Fidz no Google");
  else if (META_PIXEL_ENABLED) uses.push("anúncios da Fidz no Facebook e no Instagram");
  return uses.join(" e ");
}

function purpose(): string {
  const uses: string[] = [];
  if (MEASUREMENT_ENABLED) uses.push("melhorar esta página (PostHog)");
  if (META_PIXEL_ENABLED && GOOGLE_ADS_ENABLED) {
    uses.push("mostrar anúncios da Fidz no Facebook, no Instagram e no Google e medir o resultado deles (Meta Pixel e Google Ads)");
  } else if (GOOGLE_ADS_ENABLED) {
    uses.push("mostrar anúncios da Fidz no Google e medir o resultado deles (Google Ads)");
  } else if (META_PIXEL_ENABLED) {
    uses.push("mostrar anúncios da Fidz no Facebook e no Instagram e medir o resultado deles (Meta Pixel)");
  }
  return `Eles servem para ${uses.join(" e para ")}, com servidores nos Estados Unidos.`;
}
