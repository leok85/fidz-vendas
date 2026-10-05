import shared from "./shared.module.css";
import styles from "./Comparacao.module.css";

const COMPARACAO = [
  { antes: "Fica na carteira até ser perdido", depois: "Fica no celular do cliente" },
  { antes: "Você não sabe quem é o cliente", depois: "Nome, celular e histórico de compras" },
  { antes: "Ninguém lembra o cliente de voltar", depois: "Aviso a cada ganho e antes do saldo vencer" },
  { antes: "Impossível saber quem parou de vir", depois: "O painel mostra quem voltou e quem sumiu" },
  { antes: "Carimbo extra é fácil de fazer", depois: "Só a equipe da loja registra a compra" },
];

export default function Comparacao() {
  return (
    <section className={shared.secao}>
      <div className={shared.cabecalho}>
        <h2 className={shared.h2}>O cartão de papel não traz ninguém de volta.</h2>
        <p className={shared.lead}>
          Ele fica esquecido na carteira, você não sabe quem é o cliente e ninguém avisa que falta pouco para a
          recompensa. Veja a diferença.
        </p>
      </div>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th scope="col" className={styles.thAntes}>
              Cartão de papel
            </th>
            <th scope="col" className={styles.thDepois}>
              Com o Fidz
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARACAO.map((c) => (
            <tr key={c.antes}>
              <td className={styles.antes}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 7l10 10M17 7L7 17" />
                </svg>
                {c.antes}
              </td>
              <td className={styles.depois}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {c.depois}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
