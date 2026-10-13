import Demo from "./Demo";
import shared from "./shared.module.css";
import styles from "./Demonstracao.module.css";

export default function Demonstracao() {
  return (
    <section className={styles.fundo}>
      <div className={`${shared.secao} ${styles.secao}`}>
        <div className={`${shared.cabecalho} ${styles.cabecalho}`}>
          <span className={shared.pill}>Teste aqui</span>
          <h2 className={shared.h2}>Escolha o formato. Registrar leva segundos.</h2>
          <p className={styles.lead}>
            Troque entre selos, pontos e cashback e toque em <strong>Registrar compra</strong>.
          </p>
        </div>
        <Demo />
      </div>
    </section>
  );
}
