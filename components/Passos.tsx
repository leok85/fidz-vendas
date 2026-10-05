import shared from "./shared.module.css";
import styles from "./Passos.module.css";

const PASSOS = [
  { titulo: "Você monta sua fidelidade", texto: "Escolha selos, pontos ou cashback e defina a recompensa." },
  { titulo: "O cliente participa", texto: "No balcão, ele só informa o número de celular." },
  {
    titulo: "Cada compra vira benefício",
    texto: "A equipe registra, o app avisa o cliente e ele volta para buscar a recompensa.",
  },
];

export default function Passos() {
  return (
    <section className={shared.secao}>
      <h2 className={`${shared.h2} ${styles.titulo}`}>Funcionando na sua loja ainda hoje.</h2>
      <ol className={styles.lista}>
        {PASSOS.map((p, i) => (
          <li key={p.titulo} className={styles.passo}>
            <span className={styles.numero} aria-hidden="true">
              {i + 1}
            </span>
            <div className={styles.corpo}>
              <span className={styles.passoTitulo}>{p.titulo}</span>
              <span className={styles.passoTexto}>{p.texto}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
