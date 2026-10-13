import { readConsent, subscribeConsent } from "@/lib/consent";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
// Rótulo da conversão secundária "Clique para o cadastro" (o que vem depois da barra em
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

// Clique para criar a conta na Gestão (o mesmo do Lead do Meta). Conversão secundária: a principal
// é o cadastro concluído, que sai da Gestão depois que o banco confirma a loja.
export function trackGoogleAdsLead() {
  if (!advertising || !LEAD_LABEL) return;
  // Valor e moeda como no snippet da ação no Google Ads.
  window.gtag?.("event", "conversion", { send_to: `${ADS_ID}/${LEAD_LABEL}`, value: 1.0, currency: "BRL" });
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
