"use client";

import { useEffect, useRef, useState } from "react";
import { CADASTRO_URL, CTA } from "@/lib/links";
import styles from "./BarraFixa.module.css";

// Regra do design, igual em qualquer largura: aparece depois de 560px de rolagem e
// some quando faltam 320px para o fim (onde já está a chamada final). Em vez de um
// listener de scroll, dois sentinelas absolutos marcam esses pontos e um
// IntersectionObserver avisa quando cruzam a viewport — nada roda enquanto se rola.
export default function BarraFixa() {
  const inicio = useRef<HTMLDivElement>(null);
  const fim = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const a = inicio.current;
    const b = fim.current;
    if (!a || !b) return;

    let passouInicio = false; // sentinela de 560px já subiu acima da viewport
    let antesDoFim = true; // sentinela do fim ainda está abaixo da viewport
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const { top, bottom } = e.boundingClientRect;
        const vh = e.rootBounds?.height ?? window.innerHeight;
        if (e.target === a) passouInicio = !e.isIntersecting && bottom <= 0;
        else antesDoFim = !e.isIntersecting && top >= vh;
      }
      setVisivel(passouInicio && antesDoFim);
    });
    io.observe(a);
    io.observe(b);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={inicio} className={styles.sentinelaInicio} aria-hidden="true" />
      <div ref={fim} className={styles.sentinelaFim} aria-hidden="true" />
      <div className={styles.barra} data-visivel={visivel} inert={!visivel}>
        <a href={CADASTRO_URL} className={styles.botao}>
          <span className={styles.texto}>
            <span className={styles.cta}>{CTA}</span>
            <span className={styles.sub}>30 dias grátis · sem cartão</span>
          </span>
          <span className={styles.seta} aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </>
  );
}
