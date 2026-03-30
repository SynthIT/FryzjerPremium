"use client";

import { formatLocaleDateTime } from "@/lib/dateFormat";
import { useUser } from "@/contexts/UserContext";
import { OrderList } from "@/lib/types/orderTypes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    marketingPageContainer,
    marketingPageContent,
    marketingPageText,
    marketingPageTitle,
} from "@/components/site/marketingPageClasses";

export default function ZamowieniaPage() {
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const usercontext = useUser();

    useEffect(() => {
        async function getOrders() {
            fetch("/api/v1/users/orders", {
                method: "GET",
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.status === 200) {
                        setOrders(data.orders);
                    }
                    setLoading(false);
                });
        }
        getOrders();
    }, [usercontext.userData?.email]);

    if (loading) {
        return (
            <main className={marketingPageContainer}>
                <div className={marketingPageContent}>
                    <h1 className={marketingPageTitle}>Moje zamówienia</h1>
                    <p className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ładowanie zamówień...
                    </p>
                </div>
            </main>
        );
    }

    if (orders.length === 0) {
        return (
            <main className={marketingPageContainer}>
                <div className={marketingPageContent}>
                    <h1 className={marketingPageTitle}>Moje zamówienia</h1>
                    <div className={marketingPageText}>
                        <p>
                            W tej sekcji możesz przeglądać historię swoich zamówień, śledzić status
                            dostawy oraz zarządzać zwrotami.
                        </p>
                        <h2>Śledzenie zamówienia</h2>
                        <p>
                            Wprowadź numer zamówienia, aby sprawdzić aktualny status realizacji i dostawy.
                        </p>
                        <h2>Historia zamówień</h2>
                        <p>
                            Zaloguj się do swojego konta, aby zobaczyć pełną historię wszystkich złożonych
                            zamówień wraz z fakturami i dokumentami.
                        </p>
                        <h2>Zwroty</h2>
                        <p>
                            Możesz złożyć wniosek o zwrot produktu bezpośrednio z poziomu zamówienia.
                            Zwroty są realizowane w ciągu 14 dni od otrzymania produktu.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={marketingPageContainer}>
            <div className={marketingPageContent}>
                <h1 className={marketingPageTitle}>Moje zamówienia</h1>
                <div>
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border-2 rounded-lg p-4 border-gray-200 pb-4 mb-4 hover:cursor-pointer hover:bg-gray-100 transition-all duration-300"
                            onClick={() => {
                                router.push(`/zamowienie/${order.numer_zamowienia}`);
                            }}>
                            <h2 className="text-2xl font-bold">{order.numer_zamowienia}</h2>
                            <p className="text-sm text-gray-500">
                                {formatLocaleDateTime(order.data_zamowienia ?? null)}
                            </p>
                            <p className="text-sm text-gray-500">{order.status}</p>
                            <p className="text-sm text-gray-500">{order.suma}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
