import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartRoot from "../components/CartRoot";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coiffeur — Premium Salon",
  description: "Stylish hair care and cosmetic products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${montserrat.variable} ${playfair.variable} antialiased bg-white text-black`}>
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
