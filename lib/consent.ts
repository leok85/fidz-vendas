// Escolha do visitante sobre cookies na landing. Vale 12 meses; depois disso, ou se a versão mudar,
// o aviso aparece de novo.
//
// A escolha vale em todos os sites da Fidz: fica no cookie fidz_cookie_consent, de .fidz.com.br, que
// fidz.com.br e a Gestão leem e gravam do mesmo jeito (SHARED_*, abaixo; as três cópias precisam andar
// juntas). Uma escolha só desta origem, feita antes do cookie, fica no localStorage e continua valendo
// aqui, mas não vai para os outros sites: o aviso de antes não dizia que valeria lá. As categorias opcionais são
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

// The cookie shared by the Fidz sites. A category a site doesn't have stays out of what it writes, and
// a site needs a value for each of its own categories, or it asks. SHARED_VERSION goes up, in the three
// sites at once, when a category starts covering a new tool.
const SHARED_COOKIE = "fidz_cookie_consent";
const SHARED_VERSION = 1;
const SHARED_DOMAIN = "fidz.com.br";

interface SharedConsent {
  measurement?: boolean;
  advertising?: boolean;
  decidedAt: string;
  version: number;
}

function stillValid(decidedAt: string | undefined): boolean {
  const expiresAt = new Date(decidedAt ?? "");
  expiresAt.setMonth(expiresAt.getMonth() + VALIDITY_MONTHS);
  return !Number.isNaN(expiresAt.getTime()) && Date.now() < expiresAt.getTime();
}

function readShared(): SharedConsent | null {
  try {
    const entry = document.cookie.split("; ").find((part) => part.startsWith(`${SHARED_COOKIE}=`));
    if (!entry) return null;
    const shared = JSON.parse(decodeURIComponent(entry.slice(SHARED_COOKIE.length + 1))) as Partial<SharedConsent>;
    if (typeof shared.version !== "number" || shared.version < SHARED_VERSION || !stillValid(shared.decidedAt)) return null;
    return shared as SharedConsent;
  } catch {
    return null;
  }
}

// Only on a fidz.com.br address: on localhost or a preview URL the choice stays in localStorage.
function writeShared(choice: ConsentChoice, decidedAt: string) {
  try {
    const host = window.location.hostname;
    if (host !== SHARED_DOMAIN && !host.endsWith(`.${SHARED_DOMAIN}`)) return;
    const previous = readShared();
    const shared: SharedConsent = {
      measurement: MEASUREMENT_ENABLED ? choice.measurement : previous?.measurement,
      advertising: ADVERTISING_ENABLED ? choice.advertising : previous?.advertising,
      decidedAt,
      version: SHARED_VERSION,
    };
    const maxAge = VALIDITY_MONTHS * 31 * 24 * 60 * 60;
    document.cookie = `${SHARED_COOKIE}=${encodeURIComponent(JSON.stringify(shared))}; Domain=.${SHARED_DOMAIN}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
  } catch {
    // Sem cookie: fica a escolha do localStorage.
  }
}

// The shared choice, when it answers every category this site has, in this site's own format.
function sharedRaw(): string | null {
  const shared = readShared();
  if (!shared) return null;
  if (MEASUREMENT_ENABLED && typeof shared.measurement !== "boolean") return null;
  if (ADVERTISING_ENABLED && typeof shared.advertising !== "boolean") return null;
  return JSON.stringify({
    measurement: MEASUREMENT_ENABLED && shared.measurement === true,
    advertising: ADVERTISING_ENABLED && shared.advertising === true,
    decidedAt: shared.decidedAt,
    version: CONSENT_VERSION,
  });
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
  return parseConsent(getConsentSnapshot());
}

export function saveConsent({ measurement, advertising }: ConsentChoice) {
  const decidedAt = new Date().toISOString();
  const raw = JSON.stringify({
    measurement: MEASUREMENT_ENABLED && measurement,
    advertising: ADVERTISING_ENABLED && advertising,
    decidedAt,
    version: CONSENT_VERSION,
  });
  writeShared({ measurement, advertising }, decidedAt);
  memoryFallback = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Sem localStorage: fica o memoryFallback.
  }
  changeListeners.forEach((listener) => listener());
}

// Assinatura no formato do useSyncExternalStore. O evento "storage" traz a escolha feita em outra aba.
// Um cookie mudado em outro site da Fidz não avisa: a escolha é lida de novo quando a aba volta a
// ficar visível.
export function subscribeConsent(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") listener();
  };
  changeListeners.add(listener);
  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    changeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

// The shared cookie first, when it answers this site's categories; otherwise this origin's own choice.
// A string, so useSyncExternalStore sees the same snapshot until something changes.
export function getConsentSnapshot(): string | null {
  return sharedRaw() ?? readRaw();
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
