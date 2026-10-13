import type { PostHog } from "posthog-js";
import { MEASUREMENT_ENABLED, readConsent, subscribeConsent } from "@/lib/consent";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// localStorage e sessionStorage do PostHog: ph_<token>_* e __ph_opt_in_out_<token>.
const POSTHOG_STORAGE_KEY = /^(__)?ph_/;

let measuring = false;
let booted = false;
let posthog: PostHog | null = null;

// O PostHog (o mesmo projeto do site e da Gestão, separados pelo $host) mede visitas e cliques da
// landing. Só roda com "Medição de uso" aceita no aviso de cookies (components/CookieConsent.tsx) e
// só existe quando NEXT_PUBLIC_POSTHOG_KEY está configurado. Antes do aceite o posthog-js nem é
// baixado: nenhuma chamada de rede, nada ph_* no navegador. Mesmo modelo do fidz-site e da Gestão.
export function bootMeasurement() {
  if (booted || !MEASUREMENT_ENABLED || !POSTHOG_KEY) return;
  booted = true;
  const key = POSTHOG_KEY;
  const apply = () => {
    const allowed = readConsent()?.measurement === true;
    if (allowed && !measuring) start(key);
    if (!allowed) stop();
    measuring = allowed;
  };
  apply();
  subscribeConsent(apply);
}

// Clique num CTA, com a seção de onde ele saiu. Mesmo evento dos CTAs do site.
export function trackCtaClick(location: string, destination: "cadastro" | "whatsapp") {
  if (measuring) posthog?.capture("cta_clicked", { location, destination });
}

function start(key: string) {
  import("posthog-js")
    .then(({ default: client }) => {
      // Recusou enquanto o posthog-js baixava.
      if (!measuring) return;
      posthog = client;
      if (!client.__loaded) {
        client.init(key, {
          api_host: POSTHOG_HOST || "https://us.i.posthog.com",
          person_profiles: "identified_only",
          // Só localStorage, sem cookie: o site grava o cookie do PostHog em .fidz.com.br, e a
          // escolha feita aqui não pode ler nem apagar a que o visitante fez lá.
          persistence: "localStorage",
          capture_exceptions: true,
          // Ao revogar, o opt-out também desliga e apaga o armazenamento do PostHog.
          opt_out_persistence_by_default: true,
        });
      } else if (client.has_opted_out_capturing()) {
        // Aceitou de novo na mesma visita, depois de recusar. O reset() dá um identificador novo (o
        // anterior foi esquecido na revogação) e precisa vir antes do opt-in, que ele desfaria.
        client.reset();
        client.set_config({ opt_out_capturing_by_default: false });
        client.opt_in_capturing({ captureEventName: false });
      }
    })
    .catch(() => {
      // Sem o posthog-js a página segue igual, só sem medição.
    });
}

function stop() {
  if (posthog) {
    // Sem a escolha guardada, o PostHog volta ao padrão dele, que é capturar. Como o
    // armazenamento é apagado logo abaixo, o padrão vira "não capturar".
    posthog.set_config({ opt_out_capturing_by_default: true });
    posthog.opt_out_capturing();
  }
  // Também limpa o que ficou de visitas anteriores ao aviso de cookies.
  clearPostHogStorage();
}

function clearPostHogStorage() {
  for (const area of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[area];
      Object.keys(storage)
        .filter((key) => POSTHOG_STORAGE_KEY.test(key))
        .forEach((key) => storage.removeItem(key));
    } catch {
      // Armazenamento bloqueado pelo navegador: não há o que apagar.
    }
  }
}
