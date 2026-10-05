import { ADVERTISING_ENABLED, readConsent, subscribeConsent } from "@/lib/consent";
import { WHATSAPP_URL } from "@/lib/links";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CADASTRO_ORIGIN = "https://gestao.fidz.com.br";

// Cookies do Pixel: _fbp (navegador) e _fbc (clique em anúncio).
const PIXEL_COOKIE = /^_fb[pc]$/;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let advertising = false;
let booted = false;

// O Meta Pixel (o mesmo da Gestão) só roda com "Publicidade" aceita no aviso de cookies
// (components/CookieConsent.tsx) e só existe quando NEXT_PUBLIC_META_PIXEL_ID está configurado.
// Antes do aceite o script da Meta nem é baixado: nenhuma chamada de rede, nenhum _fbp.
export function bootAdvertising() {
  if (booted || !ADVERTISING_ENABLED || !PIXEL_ID) return;
  booted = true;
  const id = PIXEL_ID;
  const apply = () => {
    const allowed = readConsent()?.advertising === true;
    if (allowed && !advertising) start(id);
    if (!allowed && advertising) window.fbq?.("consent", "revoke");
    if (!allowed) clearPixelCookies();
    advertising = allowed;
  };
  apply();
  subscribeConsent(apply);
}

// Lead: clique para criar a conta na Gestão. Contact: clique para falar no WhatsApp.
// O cadastro concluído (CompleteRegistration) sai da Gestão, depois que o backend confirma.
export function adEventForHref(href: string): "Lead" | "Contact" | null {
  if (href.startsWith(CADASTRO_ORIGIN)) return "Lead";
  if (href.startsWith(WHATSAPP_URL)) return "Contact";
  return null;
}

export function trackAdEvent(event: "Lead" | "Contact", params?: Record<string, string>) {
  if (advertising) window.fbq?.("track", event, params);
}

function start(id: string) {
  // Aceitou de novo na mesma visita, depois de recusar: o Pixel já está iniciado e só volta a
  // enviar com o "grant".
  if (!window.fbq) {
    loadPixel();
    window.fbq!("init", id);
  }
  window.fbq!("consent", "grant");
  window.fbq!("track", "PageView");
}

// Equivalente ao código-base do Pixel: cria a fila do fbq e baixa o fbevents.js.
function loadPixel() {
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

function clearPixelCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => PIXEL_COOKIE.test(name));
  if (names.length === 0) return;

  // O Pixel grava no domínio pai (.fidz.com.br); é preciso expirar com o mesmo domínio.
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) domains.push(`; domain=.${labels.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}
