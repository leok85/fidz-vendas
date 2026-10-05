import Demo from "./Demo";
import shared from "./shared.module.css";
import styles from "./Demonstracao.module.css";

export default function Demonstracao() {
  return (
    <section className={styles.fundo}>
      <div className={shared.secao}>
        <div className={`${shared.cabecalho} ${styles.cabecalho}`}>
          <span className={shared.pill}>Teste aqui</span>
          <h2 className={shared.h2}>Registrar uma compra leva segundos.</h2>
          <p className={styles.lead}>
            Toque em <strong>Registrar compra</strong> e veja o que chega no celular do cliente.
          </p>
        </div>
        <Demo />
      </div>
    </section>
  );
}
