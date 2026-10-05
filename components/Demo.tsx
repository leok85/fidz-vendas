"use client";

import { useState } from "react";
import { Aviso, FaixaRecompensa, Selos, TOTAL_SELOS } from "./Cartela";
import shared from "./shared.module.css";
import styles from "./Demo.module.css";

const INICIAL = 7;

// Única parte interativa acima do rodapé: o estado vive só aqui para o resto da página ser estático.
export default function Demo() {
  const [n, setN] = useState(INICIAL);
  const completo = n >= TOTAL_SELOS;
  const faltam = TOTAL_SELOS - n;

  const aviso = completo
    ? "Cartela completa! Seu café com pão na chapa está liberado."
    : n === INICIAL
      ? `Você tem ${INICIAL} selos. Faltam ${faltam} para o café com pão na chapa.`
      : `Mais um selo! Faltam ${faltam} para o café com pão na chapa.`;

  return (
    <div className={styles.grade}>
      <div className={styles.balcao}>
        <span className={shared.rotulo}>No balcão da loja</span>
        <div className={styles.cliente}>
          <span className={styles.avatar} aria-hidden="true">
            M
          </span>
          <div className={styles.clienteInfo}>
            <span className={styles.clienteNome}>Marina Souza</span>
            <span className={styles.clienteMeta}>
              (48) 99876-5432 · {completo ? "cartela completa" : `${n} de ${TOTAL_SELOS} selos`}
            </span>
          </div>
        </div>
        <div className={styles.valor}>
          <span className={styles.valorRotulo}>Valor da compra</span>
          <div className={styles.valorCampo}>
            <span className={styles.valorNumero}>R$ 23,50</span>
            <span className={styles.valorSelo}>+ 1 selo</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.botao}
          onClick={() => setN((s) => (s >= TOTAL_SELOS ? INICIAL : s + 1))}
        >
          {completo ? "Recomeçar" : "Registrar compra"}
        </button>
      </div>

      <div className={styles.celular}>
        <span className={shared.rotulo}>No celular do cliente</span>
        <div aria-live="polite">
          <Aviso texto={aviso} className={styles.aviso} />
        </div>
        <div className={styles.cartela}>
          <Selos cheios={n} />
          <FaixaRecompensa faltam={completo ? "Liberada" : `Faltam ${faltam}`} completa={completo} />
        </div>
      </div>
    </div>
  );
}
