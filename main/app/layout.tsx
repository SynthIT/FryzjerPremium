import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

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
                <NotificationProvider>
                    <CartProvider>
                        <UserProvider>{children}</UserProvider>
                    </CartProvider>
                </NotificationProvider>
            </body>
        </html>
    );
}
