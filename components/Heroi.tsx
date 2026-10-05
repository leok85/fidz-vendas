import { CADASTRO_URL, CTA } from "@/lib/links";
import { Aviso, FaixaRecompensa, Selos } from "./Cartela";
import shared from "./shared.module.css";
import styles from "./Heroi.module.css";

export default function Heroi() {
  return (
    <section id="heroi" className={styles.heroi}>
      <div className={`${shared.bolha} ${styles.bolhaA}`} aria-hidden="true" />
      <div className={`${shared.bolha} ${styles.bolhaB}`} aria-hidden="true" />

      <header className={`${shared.container} ${styles.topo}`}>
        <div className={styles.logo}>
          {/* WebP já otimizado e com tamanho fixo: <img> evita o JS do next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/fidz-logo.webp" alt="Fidz" width={78} height={34} decoding="async" />
        </div>
        <span className={styles.publico}>Para estabelecimentos</span>
      </header>

      <div className={`${shared.container} ${styles.grade}`}>
        <div className={styles.texto}>
          <h1 className={styles.h1}>
            Seu cliente comprou hoje. <span className={shared.destaque}>O Fidz faz ele voltar.</span>
          </h1>
          <p className={styles.lead}>
            Cartão fidelidade com selos, pontos ou cashback no celular do cliente. Para padarias, cafés,
            barbearias, salões e todo comércio de bairro.
          </p>
          <div className={styles.acao}>
            <a href={CADASTRO_URL} className={shared.ctaAmarelo}>
              {CTA} <span className={shared.seta} aria-hidden="true">→</span>
            </a>
            <span className={styles.garantia}>30 dias grátis · Sem cartão de crédito · Cancele quando quiser</span>
          </div>
        </div>

        <div className={styles.cartelaWrap} aria-hidden="true">
          <div className={styles.cartela}>
            <Aviso texto="Mais um selo! Faltam 3 para o café com pão na chapa." />
            <div className={styles.cartelaTopo}>
              <span className={styles.cartelaTitulo}>Seus selos</span>
              <span className={styles.cartelaConta}>7 de 10</span>
            </div>
            <Selos cheios={7} />
            <FaixaRecompensa faltam="Faltam 3" />
          </div>
        </div>
      </div>
    </section>
  );
}
