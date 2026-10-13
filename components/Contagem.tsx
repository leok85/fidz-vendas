"use client";

import { useSyncExternalStore } from "react";
import { FIM_OFERTA_TEXTO, p2, restante, type Restante } from "@/lib/oferta";

// Um único relógio de 1s para todas as contagens da página.
const ouvintes = new Set<() => void>();
let relogio: ReturnType<typeof setInterval> | undefined;

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  relogio ??= setInterval(() => ouvintes.forEach((o) => o()), 1000);
  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) {
      clearInterval(relogio);
      relogio = undefined;
    }
  };
}

const segundoAtual = () => Math.floor(Date.now() / 1000);

// No HTML estático (e na hidratação) o tempo é desconhecido: mostra "--" em vez de um valor
// que já estaria velho e quebraria a hidratação.
function useRestante(): Restante | null {
  const s = useSyncExternalStore(assinar, segundoAtual, () => null);
  return s === null ? null : restante(s * 1000);
}

interface ClassesBlocos {
  grade: string;
  bloco: string;
  valor: string;
  rotulo: string;
}

export function ContagemBlocos({ classes }: { classes: ClassesBlocos }) {
  const r = useRestante();
  const blocos = [
    { v: r && p2(r.dias), l: "dias" },
    { v: r && p2(r.horas), l: "horas" },
    { v: r && p2(r.minutos), l: "min" },
    { v: r && p2(r.segundos), l: "seg" },
  ];
  return (
    <div className={classes.grade} role="timer" aria-label={FIM_OFERTA_TEXTO}>
      {blocos.map((b) => (
        <div key={b.l} className={classes.bloco} aria-hidden="true">
          <span className={classes.valor}>{b.v ?? "--"}</span>
          <span className={classes.rotulo}>{b.l}</span>
        </div>
      ))}
    </div>
  );
}

export function ContagemCurta() {
  const r = useRestante();
  const texto = r
    ? `${r.dias}d ${p2(r.horas)}h ${p2(r.minutos)}m ${p2(r.segundos)}s`
    : "--d --h --m --s";
  return (
    <span role="timer" aria-label={FIM_OFERTA_TEXTO} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden="true">{texto}</span>
    </span>
  );
}
