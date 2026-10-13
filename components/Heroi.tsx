import { CADASTRO_URL } from "@/lib/links";
import { ContagemBlocos } from "./Contagem";
import shared from "./shared.module.css";
import styles from "./Heroi.module.css";

const TIPOS = [
  {
    tipo: "Selos",
    loja: "Padaria Trigo Dourado",
    ganho: "+1 selo",
    pct: "70%",
    legenda: "7 de 10 selos · Café com pão na chapa",
  },
  {
    tipo: "Pontos",
    loja: "Barbearia Navalha",
    ganho: "+45 pontos",
    pct: "60%",
    legenda: "180 de 300 pontos · Corte de cabelo",
  },
  {
    tipo: "Cashback",
    loja: "Café da Lagoa",
    ganho: "+R$ 2,10 de cashback",
    pct: null,
    legenda: "Saldo R$ 12,60 · 5% de cada compra",
  },
];

export default function Heroi() {
  return (
    <section id="heroi" className={styles.heroi}>
      <header className={`${shared.container} ${styles.topo}`}>
        {/* WebP já otimizado e com tamanho fixo: <img> evita o JS do next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/fidz-logo-branca.webp"
          alt="Fidz"
          width={131}
          height={56}
          decoding="async"
          className={styles.logo}
        />
      </header>

      <div className={styles.centro}>
        <span className={styles.selo}>OFERTA</span>
        <h1 className={styles.h1}>
          30 dias grátis de Fidz <span className={shared.destaque}>só até 31 de outubro.</span>
        </h1>
        <p className={styles.lead}>
          Fidelidade com selos, pontos ou cashback no celular do cliente. Cadastre agora e garanta o mês grátis.
        </p>
        <ContagemBlocos
          classes={{ grade: styles.contagem, bloco: styles.bloco, valor: styles.blocoValor, rotulo: styles.blocoRotulo }}
        />
        <a href={CADASTRO_URL} className={`${shared.ctaAmarelo} ${styles.cta}`}>
          Garantir meus 30 dias grátis <span className={shared.seta} aria-hidden="true">→</span>
        </a>
      </div>

      <ul className={`${shared.container} ${styles.tipos}`} aria-label="Exemplos de fidelidade">
        {TIPOS.map((t) => (
          <li key={t.tipo} className={styles.tipo}>
            <div className={styles.tipoTopo}>
              <span className={styles.tipoNome}>{t.tipo}</span>
              <span className={styles.tipoLoja}>{t.loja}</span>
            </div>
            <span className={styles.tipoGanho}>{t.ganho}</span>
            {t.pct && (
              <div className={styles.barra} aria-hidden="true">
                <div className={styles.barraCheia} style={{ width: t.pct }} />
              </div>
            )}
            <span className={styles.tipoLegenda}>{t.legenda}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
