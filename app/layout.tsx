import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Self-hosted pelo next/font: sem request para o Google, com fallback ajustado (sem CLS).
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const TITLE = "Fidz · Cartão fidelidade digital para o seu comércio";
const DESCRIPTION =
  "Cartão fidelidade com selos, pontos ou cashback no celular do cliente. Para padarias, cafés, barbearias, salões e todo comércio de bairro. 30 dias grátis, sem cartão de crédito.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon/favicon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Fidz",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B2EBA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
