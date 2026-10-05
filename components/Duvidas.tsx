import styles from "./Duvidas.module.css";

const DUVIDAS = [
  [
    "Preciso comprar algum equipamento?",
    "Não. O balcão funciona em qualquer celular, tablet ou computador com navegador.",
  ],
  [
    "O cliente precisa instalar alguma coisa?",
    "Não. No balcão, ele só informa o número de celular para participar. Se quiser acompanhar as fidelidades e receber os avisos, pode baixar o app do Fidz, que é gratuito.",
  ],
  [
    "Cashback é dinheiro?",
    "Não. É um desconto que a sua loja concede para as próximas compras nela. Ninguém saca, e nenhum dinheiro passa pelo Fidz.",
  ],
  [
    "Posso cancelar depois?",
    "A qualquer momento, pelo painel e sem multa. Clientes com saldo continuam podendo usar o que juntaram por pelo menos 30 dias.",
  ],
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: DUVIDAS.map(([p, r]) => ({
    "@type": "Question",
    name: p,
    acceptedAnswer: { "@type": "Answer", text: r },
  })),
};

// Acordeão nativo: <details name> abre um item por vez sem nenhum JavaScript.
export default function Duvidas() {
  return (
    <section className={styles.fundo}>
      <div className={styles.secao}>
        <h2 className={styles.titulo}>Antes de começar</h2>
        <div>
          {DUVIDAS.map(([p, r]) => (
            <details key={p} name="duvidas" className={styles.item}>
              <summary className={styles.pergunta}>
                <span>{p}</span>
                <span className={styles.sinal} aria-hidden="true" />
              </summary>
              <p className={styles.resposta}>{r}</p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
    </section>
  );
}
