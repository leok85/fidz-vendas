import { CADASTRO_ESSENCIAL_URL, CTA } from "@/lib/links";
import shared from "./shared.module.css";
import styles from "./Oferta.module.css";

const INCLUIDOS = [
  "Selos, pontos e cashback",
  "Balcão no celular, tablet ou computador",
  "App gratuito para os seus clientes",
  "Painel com clientes e relatórios",
  "Material de divulgação para a loja",
];

const GARANTIAS = [
  "Sem cartão de crédito para testar",
  "Sem multa para cancelar",
  "Mensalidade fixa, sem cobrança por uso",
];

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function Oferta() {
  return (
    <section id="oferta" className={styles.secao}>
      <div className={styles.caixa}>
        <div className={styles.topo}>
          <span className={shared.pill}>Oferta para começar</span>
          <h2 className={styles.titulo}>Use o Fidz por 30 dias sem pagar nada.</h2>
        </div>
        <div className={styles.grade}>
          <div className={styles.incluidos}>
            <span className={shared.rotulo}>Você recebe</span>
            <ul className={styles.lista}>
              {INCLUIDOS.map((i) => (
                <li key={i} className={styles.item}>
                  <span className={styles.itemIcone}>
                    <Check />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.preco}>
            <div className={styles.hoje}>
              <span className={styles.precoRotulo}>Hoje</span>
              <span className={styles.zero}>R$ 0</span>
            </div>
            <div className={styles.depois}>
              <span className={styles.precoRotulo}>Depois dos 30 dias, se quiser continuar</span>
              <span className={styles.mensal}>
                R$ 99/mês <span className={styles.porDia}>· menos de R$ 3,30 por dia</span>
              </span>
              <span className={styles.planos}>
                Plano Essencial, 1 loja. Até 5 lojas: R$ 199/mês. 6 ou mais: R$ 499/mês.
              </span>
            </div>
            <a href={CADASTRO_ESSENCIAL_URL} className={styles.cta}>
              {CTA} <span aria-hidden="true">→</span>
            </a>
            <ul className={styles.garantias}>
              {GARANTIAS.map((g) => (
                <li key={g} className={styles.garantia}>
                  <Check className={styles.garantiaIcone} />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
