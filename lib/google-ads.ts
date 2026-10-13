import { readConsent, subscribeConsent } from "@/lib/consent";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
// Rótulo da conversão secundária "Clique de saída" (o que vem depois da barra em
// send_to: 'AW-…/rótulo'). Sem ele a tag carrega, mas o clique não vira conversão.
const LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;

// Cookies da tag: _gcl_au (navegador), _gcl_aw/_gcl_gb/_gcl_dc (clique em anúncio).
const ADS_COOKIE = /^_gcl_/;

const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" } as const;
const GRANTED = { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" } as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let advertising = false;
let booted = false;

// A tag do Google Ads (a mesma da Gestão) segue a categoria "Publicidade" do Meta Pixel
// (lib/meta-pixel.ts) e só existe quando NEXT_PUBLIC_GOOGLE_ADS_ID está configurado. Antes do
// aceite o gtag.js nem é baixado: nenhuma chamada de rede, nenhum _gcl_* no navegador.
// Aqui ela só guarda o clique do anúncio: o gtag grava o gclid no cookie _gcl_aw do domínio pai
// (.fidz.com.br) e a tag da Gestão lê esse cookie quando sai a conversão do cadastro concluído.
export function bootGoogleAds() {
  if (booted || !ADS_ID) return;
  booted = true;
  const id = ADS_ID;
  const apply = () => {
    const allowed = readConsent()?.advertising === true;
    if (allowed && !advertising) start(id);
    if (!allowed && advertising) window.gtag?.("consent", "update", DENIED);
    if (!allowed) clearAdsCookies();
    advertising = allowed;
  };
  apply();
  subscribeConsent(apply);
}

// Tempo máximo segurando a ida para a Gestão enquanto a conversão é enviada.
const NAVIGATION_TIMEOUT_MS = 1000;

// Clique para criar a conta na Gestão (o mesmo do Lead do Meta). Conversão secundária: a principal
// é o cadastro concluído, que sai da Gestão depois que o banco confirma a loja.
// O link sai desta página, e a navegação pode cortar o envio no meio. Como no gtag_report_conversion
// do Google, o clique comum segura a navegação até o event_callback (ou o limite de tempo). Clique
// com Ctrl/Cmd, botão do meio ou link em outra aba seguem normais, porque esta página não fecha.
export function trackGoogleAdsLead(event: MouseEvent, link: HTMLAnchorElement) {
  if (!advertising || !LEAD_LABEL || !window.gtag) return;
  const sameTab =
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) &&
    (!link.target || link.target === "_self");

  // Sem valor nem moeda, como no snippet da ação no Google Ads.
  const params: Record<string, unknown> = { send_to: `${ADS_ID}/${LEAD_LABEL}` };
  if (sameTab) {
    event.preventDefault();
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      window.location.href = link.href;
    };
    params.event_callback = go;
    setTimeout(go, NAVIGATION_TIMEOUT_MS);
  }
  window.gtag("event", "conversion", params);
}

function start(id: string) {
  // Aceitou de novo na mesma visita, depois de recusar: a tag já está carregada e só volta a
  // enviar com o "granted".
  if (window.gtag) {
    window.gtag("consent", "update", GRANTED);
    return;
  }
  loadTag(id);
  window.gtag!("consent", "default", GRANTED);
  window.gtag!("js", new Date());
  window.gtag!("config", id);
}

// Equivalente ao código-base da tag (gtag.js): cria o dataLayer e baixa o script.
function loadTag(id: string) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // O gtag.js espera o objeto arguments, não um array.
    window.dataLayer!.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

function clearAdsCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => ADS_COOKIE.test(name));
  if (names.length === 0) return;

  // A tag grava no domínio pai (.fidz.com.br); é preciso expirar com o mesmo domínio.
  const labels = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < labels.length - 1; i++) domains.push(`; domain=.${labels.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}
