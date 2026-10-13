// Fim da oferta de 30 dias grátis, no horário de Brasília (o design usa o fuso do navegador).
// Depois disso a contagem fica zerada; os textos "só até 31 de outubro" precisam ser trocados.
export const FIM_OFERTA = new Date("2026-10-31T23:59:59-03:00").getTime();
export const FIM_OFERTA_TEXTO = "Oferta termina em 31 de outubro, às 23h59";

export interface Restante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

export function restante(agora: number): Restante {
  const s = Math.max(0, Math.floor((FIM_OFERTA - agora) / 1000));
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
  };
}

export const p2 = (n: number) => String(n).padStart(2, "0");
