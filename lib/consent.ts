// Escolha do visitante sobre cookies na landing. Fica no localStorage deste domínio e vale
// 12 meses; depois disso, ou se a versão mudar, o aviso aparece de novo. As categorias opcionais são
// "Medição de uso" (PostHog, lib/analytics.ts) e "Publicidade" (Meta Pixel, lib/meta-pixel.ts, e tag
// do Google Ads, lib/google-ads.ts). Mesmo modelo da Gestão.

const STORAGE_KEY = "fidz_vendas_cookie_consent";
const VALIDITY_MONTHS = 12;

// Cada ferramenta só existe com a sua variável configurada. Sem nenhuma delas não há o que
// pedir: o aviso nem aparece e tudo fica recusado.
export const MEASUREMENT_ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
export const META_PIXEL_ENABLED = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);
export const GOOGLE_ADS_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
export const ADVERTISING_ENABLED = META_PIXEL_ENABLED || GOOGLE_ADS_ENABLED;
export const CONSENT_ENABLED = MEASUREMENT_ENABLED || ADVERTISING_ENABLED;

// Ligar o Google Ads subiu a versão para 2: quem aceitou "Publicidade" só com o Meta Pixel escolheu
// de novo. Ligar o PostHog sobe para 3: quem só escolheu sobre publicidade escolhe também sobre a
// medição. Desligado, uma escolha de versão maior continua valendo.
const CONSENT_VERSION = MEASUREMENT_ENABLED ? 3 : GOOGLE_ADS_ENABLED ? 2 : 1;

export interface ConsentChoice {
  measurement: boolean;
  advertising: boolean;
}

export interface CookieConsent extends ConsentChoice {
  decidedAt: string;
  version: number;
}

const changeListeners = new Set<() => void>();
const openListeners = new Set<() => void>();

// Se o navegador bloquear o localStorage, a escolha vale só para esta página.
let memoryFallback: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memoryFallback;
  } catch {
    return memoryFallback;
  }
}

export function parseConsent(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null;
  try {
    const consent = JSON.parse(raw) as Partial<CookieConsent>;
    if (
      typeof consent.version !== "number" ||
      consent.version < CONSENT_VERSION ||
      typeof consent.advertising !== "boolean"
    ) {
      return null;
    }
    const expiresAt = new Date(consent.decidedAt ?? "");
    expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS);
    if (Number.isNaN(expiresAt.getTime()) || Date.now() >= expiresAt.getTime()) return null;
    // Escolhas da versão 2 não têm "measurement": sem o PostHog ligado, a medição fica recusada.
    return {
      ...(consent as CookieConsent),
      measurement: MEASUREMENT_ENABLED && consent.measurement === true,
      advertising: ADVERTISING_ENABLED && consent.advertising,
    };
  } catch {
    return null;
  }
}

export function readConsent(): CookieConsent | null {
  return parseConsent(readRaw());
}

export function saveConsent({ measurement, advertising }: ConsentChoice) {
  const raw = JSON.stringify({
    measurement: MEASUREMENT_ENABLED && measurement,
    advertising: ADVERTISING_ENABLED && advertising,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  });
  memoryFallback = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Sem localStorage: fica o memoryFallback.
  }
  changeListeners.forEach((listener) => listener());
}

// Assinatura no formato do useSyncExternalStore. O evento "storage" traz a escolha feita em outra aba.
export function subscribeConsent(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  changeListeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    changeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getConsentSnapshot(): string | null {
  return readRaw();
}

// No servidor a escolha é desconhecida (undefined), diferente de "ainda não escolheu" (null):
// assim o aviso não entra no HTML estático nem pisca na hidratação.
export function getServerConsentSnapshot(): undefined {
  return undefined;
}

// O botão "Preferências de cookies" do rodapé reabre o aviso.
export function openCookiePreferences() {
  openListeners.forEach((listener) => listener());
}

export function onOpenCookiePreferences(listener: () => void) {
  openListeners.add(listener);
  return () => {
    openListeners.delete(listener);
  };
}
