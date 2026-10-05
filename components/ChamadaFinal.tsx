import { CADASTRO_URL, CTA, WHATSAPP_URL } from "@/lib/links";
import shared from "./shared.module.css";
import styles from "./ChamadaFinal.module.css";

export default function ChamadaFinal() {
  return (
    <section id="final" className={styles.fundo}>
      <div className={`${shared.bolha} ${styles.bolha}`} aria-hidden="true" />
      <div className={styles.conteudo}>
        <h2 className={styles.titulo}>
          Seu próximo cliente fiel passa pelo balcão <span className={shared.destaque}>hoje</span>.
        </h2>
        <p className={styles.lead}>Cadastro em poucos minutos. 30 dias grátis, sem cartão de crédito.</p>
        <a href={CADASTRO_URL} className={`${shared.ctaAmarelo} ${styles.cta}`}>
          {CTA} <span aria-hidden="true">→</span>
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className={styles.whatsapp}>
          Prefere conversar antes? Fale no WhatsApp →
        </a>
        <footer className={styles.rodape}>
          <span>© 2026 Fidz · Kofe Dev Ltda. · CNPJ 47.596.402/0001-64</span>
          <a href="https://fidz.com.br/privacidade">Privacidade</a>
          <a href="https://fidz.com.br/termos-de-uso">Termos de uso</a>
        </footer>
      </div>
    </section>
  );
}
