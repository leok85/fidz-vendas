import BarraFixa from "@/components/BarraFixa";
import ChamadaFinal from "@/components/ChamadaFinal";
import CookieConsent from "@/components/CookieConsent";
import Comparacao from "@/components/Comparacao";
import Demonstracao from "@/components/Demonstracao";
import Duvidas from "@/components/Duvidas";
import Heroi from "@/components/Heroi";
import Oferta from "@/components/Oferta";
import Passos from "@/components/Passos";

// Página 100% estática (prerender no build). Só Demo, BarraFixa e o aviso de cookies hidratam no cliente.
export default function Home() {
  return (
    <>
      <main>
        <Heroi />
        <Comparacao />
        <Demonstracao />
        <Passos />
        <Oferta />
        <Duvidas />
        <ChamadaFinal />
      </main>
      <BarraFixa />
      <CookieConsent />
    </>
  );
}
