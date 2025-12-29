import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";

const dmSans = DM_Sans({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Fryzjerpremium.pl",
    description: "Fryzjerpremium.pl - Sklep fryzjerski",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl">
            <body className={`${dmSans.variable} antialiased`}>
                <CartProvider>
                    <UserProvider>{children}</UserProvider>
                </CartProvider>
            </body>
        </html>
    );
}
