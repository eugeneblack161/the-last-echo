import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { GameStoreHydration } from "@/components/GameStoreHydration";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant-family",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cinzel-family",
});

export const metadata: Metadata = {
  title: "The Last Echo",
  description: "Мрачная история о памяти, связи и цене выбора.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${cinzel.variable} h-full`}
    >
      <body className={`${cormorant.className} min-h-full`}>
        <GameStoreHydration>{children}</GameStoreHydration>
      </body>
    </html>
  );
}
