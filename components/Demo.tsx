"use client";

import { useState } from "react";
import { Aviso, FaixaRecompensa, RECOMPENSA, Selos, TOTAL_SELOS } from "./Cartela";
import shared from "./shared.module.css";
import styles from "./Demo.module.css";

type Tipo = "selos" | "pontos" | "cashback";

const ABAS: { tipo: Tipo; nome: string }[] = [
  { tipo: "selos", nome: "Selos" },
  { tipo: "pontos", nome: "Pontos" },
  { tipo: "cashback", nome: "Cashback" },
];

// Compra de R$ 23,50 nos três formatos.
const COMPRA = 2350;
const SELOS_INICIAL = 7;
const PONTOS_INICIAL = 154;
const META_PONTOS = 200;
const GANHO_PONTOS = Math.floor(COMPRA / 100);
const CASH_INICIAL = 840;
const PCT_CASHBACK = 5;
const GANHO_CASH = Math.round((COMPRA * PCT_CASHBACK) / 100);
const CASH_MAXIMO = CASH_INICIAL + GANHO_CASH * 3;

const brl = (centavos: number) => `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;

interface Tela {
  ganho: string;
  regra: string;
  saldoCurto: string;
  aviso: string;
  faixaRotulo: string;
  faixaNome: string;
  faixaLado: string;
  completa: boolean;
  botao: string;
}

// Única parte interativa acima do rodapé: o estado vive só aqui para o resto da página ser estático.
export default function Demo() {
  const [tipo, setTipo] = useState<Tipo>("selos");
  const [selos, setSelos] = useState(SELOS_INICIAL);
  const [pontos, setPontos] = useState(PONTOS_INICIAL);
  const [cash, setCash] = useState(CASH_INICIAL);

  let tela: Tela;
  if (tipo === "selos") {
    const ok = selos >= TOTAL_SELOS;
    const falta = TOTAL_SELOS - selos;
    tela = {
      ganho: "+ 1 selo",
      regra: `1 selo por compra · ${TOTAL_SELOS} selos = ${RECOMPENSA}`,
      saldoCurto: ok ? "cartela completa" : `${selos} de ${TOTAL_SELOS} selos`,
      aviso: ok
        ? `Cartela completa! ${RECOMPENSA} liberado.`
        : selos === SELOS_INICIAL
          ? `Você tem ${selos} selos. Faltam ${falta} para ${RECOMPENSA}.`
          : `Mais um selo! Faltam ${falta} para ${RECOMPENSA}.`,
      faixaRotulo: "Recompensa",
      faixaNome: RECOMPENSA,
      faixaLado: ok ? "Liberada" : `Faltam ${falta}`,
      completa: ok,
      botao: ok ? "Recomeçar" : "Registrar compra",
    };
  } else if (tipo === "pontos") {
    const ok = pontos >= META_PONTOS;
    const falta = Math.max(0, META_PONTOS - pontos);
    tela = {
      ganho: `+ ${GANHO_PONTOS} pontos`,
      regra: `1 ponto por R$ 1 · ${META_PONTOS} pontos = ${RECOMPENSA}`,
      saldoCurto: `${pontos} pontos`,
      aviso: ok
        ? `${pontos} pontos! ${RECOMPENSA} liberado.`
        : pontos === PONTOS_INICIAL
          ? `Você tem ${pontos} pontos. Faltam ${falta} para ${RECOMPENSA}.`
          : `+${GANHO_PONTOS} pontos. Faltam ${falta} para ${RECOMPENSA}.`,
      faixaRotulo: "Troca",
      faixaNome: RECOMPENSA,
      faixaLado: ok ? "Liberada" : `Faltam ${falta}`,
      completa: ok,
      botao: ok ? "Recomeçar" : "Registrar compra",
    };
  } else {
    tela = {
      ganho: `+ ${brl(GANHO_CASH)}`,
      regra: `${PCT_CASHBACK}% de cashback em cada compra`,
      saldoCurto: `${brl(cash)} de cashback`,
      aviso:
        cash === CASH_INICIAL
          ? `Seu saldo é ${brl(cash)}.`
          : `+${brl(GANHO_CASH)} de cashback. Saldo: ${brl(cash)}.`,
      faixaRotulo: "Cashback",
      faixaNome: `${PCT_CASHBACK}% de cada compra`,
      faixaLado: "Use na próxima",
      completa: false,
      botao: cash >= CASH_MAXIMO ? "Recomeçar" : "Registrar compra",
    };
  }

  function registrar() {
    if (tipo === "selos") setSelos((s) => (s >= TOTAL_SELOS ? SELOS_INICIAL : s + 1));
    else if (tipo === "pontos") setPontos((p) => (p >= META_PONTOS ? PONTOS_INICIAL : p + GANHO_PONTOS));
    else setCash((c) => (c >= CASH_MAXIMO ? CASH_INICIAL : c + GANHO_CASH));
  }

  return (
    <>
      <div className={styles.abas} role="group" aria-label="Formato da fidelidade">
        {ABAS.map((a) => (
          <button
            key={a.tipo}
            type="button"
            className={styles.aba}
            aria-pressed={a.tipo === tipo}
            onClick={() => setTipo(a.tipo)}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <div className={styles.grade}>
        <div className={styles.balcao}>
          <span className={shared.rotulo}>No balcão da loja</span>
          <div className={styles.cliente}>
            <span className={styles.avatar} aria-hidden="true">
              M
            </span>
            <div className={styles.clienteInfo}>
              <span className={styles.clienteNome}>Marina Souza</span>
              <span className={styles.clienteMeta}>(48) 99876-5432 · {tela.saldoCurto}</span>
            </div>
          </div>
          <div className={styles.valor}>
            <span className={styles.valorRotulo}>Valor da compra</span>
            <div className={styles.valorCampo}>
              <span className={styles.valorNumero}>{brl(COMPRA)}</span>
              <span className={styles.valorSelo}>{tela.ganho}</span>
            </div>
            <span className={styles.valorRotulo}>{tela.regra}</span>
          </div>
          <button type="button" className={styles.botao} onClick={registrar}>
            {tela.botao}
          </button>
        </div>

        <div className={styles.celular}>
          <span className={shared.rotulo}>No celular do cliente</span>
          <div aria-live="polite">
            <Aviso texto={tela.aviso} className={styles.aviso} />
          </div>
          <div className={styles.cartela}>
            {tipo === "selos" && <Selos cheios={selos} />}
            {tipo === "pontos" && (
              <div className={styles.pontos}>
                <span className={styles.valorGrande}>{pontos} pts</span>
                <div className={styles.barra} aria-hidden="true">
                  <div
                    className={styles.barraCheia}
                    style={{ width: `${Math.min(100, (pontos / META_PONTOS) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {tipo === "cashback" && (
              <div className={styles.cashback}>
                <span className={styles.valorRotulo}>Saldo de cashback</span>
                <span className={styles.valorGrande}>{brl(cash)}</span>
              </div>
            )}
            <FaixaRecompensa
              rotulo={tela.faixaRotulo}
              nome={tela.faixaNome}
              lado={tela.faixaLado}
              completa={tela.completa}
            />
          </div>
        </div>
      </div>
    </>
  );
}
