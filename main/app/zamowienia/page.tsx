"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUser } from "@/contexts/UserContext";
import { OrderList } from "@/lib/types/orderTypes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";


const pageContainer = "max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative";
const pageContent = "max-w-[900px] mx-auto relative z-10 bg-white/60 backdrop-blur-[10px] p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/20";
const pageTitle = "text-[52px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-gradient-to-r after:from-[#D2B79B] after:via-[#b89a7f] after:to-[#D2B79B] after:rounded";
const pageText = "text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]";

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const usercontext = useUser();
    useEffect(() => {
        async function getOrders() {
            fetch("/api/v1/users/orders", {
                method: "GET",
                credentials: "include",
            }).then((res) => res.json()).then((data) => {
                if (data.status === 200) {
                    setOrders(data.orders);
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            });
        }
        getOrders();
    }, [usercontext.userData?.email]);
    if (loading) {
        return (
            <>
                <Header />
                <main className={pageContainer}>
                    <div className={pageContent}>
                        <h1 className={pageTitle}>Moje zamówienia</h1>
                        <p className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Ładowanie zamówień...
                        </p>
                    </div>
                </main >
                <Footer />
            </>)
    }
    if (orders.length === 0) {
        return (
            <>
                <Header />
                <main className={pageContainer}>
                    <div className={pageContent}>
                        <h1 className={pageTitle}>Moje zamówienia</h1>
                        <div className={pageText}>
                            <p>
                                W tej sekcji możesz przeglądać historię swoich zamówień, śledzić status dostawy
                                oraz zarządzać zwrotami.
                            </p>
                            <h2>Śledzenie zamówienia</h2>
                            <p>
                                Wprowadź numer zamówienia, aby sprawdzić aktualny status realizacji i dostawy.
                            </p>
                            <h2>Historia zamówień</h2>
                            <p>
                                Zaloguj się do swojego konta, aby zobaczyć pełną historię wszystkich złożonych zamówień
                                wraz z fakturami i dokumentami.
                            </p>
                            <h2>Zwroty</h2>
                            <p>
                                Możesz złożyć wniosek o zwrot produktu bezpośrednio z poziomu zamówienia.
                                Zwroty są realizowane w ciągu 14 dni od otrzymania produktu.
                            </p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className={pageContainer}>
                <div className={pageContent}>
                    <h1 className={pageTitle}>Moje zamówienia</h1>
                    <div>
                        {orders.map((order) => (
                            <div key={order._id} className="border-2 rounded-lg p-4 border-gray-200 pb-4 mb-4 hover:cursor-pointer hover:bg-gray-100 transition-all duration-300" onClick={() => {
                                router.push(`/zamowienie/${order.numer_zamowienia}`);
                            }}>
                                <h2 className="text-2xl font-bold">{order.numer_zamowienia}</h2>
                                <p className="text-sm text-gray-500">{order.createdAt}</p>
                                <p className="text-sm text-gray-500">{order.status}</p>
                                <p className="text-sm text-gray-500">{order.suma}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>)
}

