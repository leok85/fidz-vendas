import styles from "./Cartela.module.css";

export const TOTAL_SELOS = 10;
export const RECOMPENSA = "Café com pão na chapa";

export function Aviso({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={`${styles.aviso} ${className ?? ""}`}>
      <span className={styles.avisoIcone} aria-hidden="true">
        F
      </span>
      <div className={styles.avisoCorpo}>
        <span className={styles.avisoMeta}>Fidz · agora</span>
        <span className={styles.avisoTexto}>
          <strong>Padaria Trigo Dourado</strong> · {texto}
        </span>
      </div>
    </div>
  );
}

export function Selos({ cheios }: { cheios: number }) {
  return (
    <div className={styles.selos} role="img" aria-label={`${cheios} de ${TOTAL_SELOS} selos`}>
      {Array.from({ length: TOTAL_SELOS }, (_, i) => (
        <span
          key={i}
          className={i < cheios ? styles.seloCheio : i === cheios ? styles.seloProximo : styles.seloVazio}
        >
          {i < cheios ? "★" : null}
        </span>
      ))}
    </div>
  );
}

export function FaixaRecompensa({ faltam, completa = false }: { faltam: string; completa?: boolean }) {
  return (
    <div className={`${styles.faixa} ${completa ? styles.faixaCompleta : ""}`}>
      <div className={styles.faixaInfo}>
        <span className={styles.faixaRotulo}>Recompensa</span>
        <span className={styles.faixaNome}>{RECOMPENSA}</span>
      </div>
      <span className={styles.faixaFaltam}>{faltam}</span>
    </div>
  );
}
