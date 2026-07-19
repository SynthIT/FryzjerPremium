"use client";

import { formatLocaleDateTime } from "@/lib/dateFormat";
import { useUser } from "@/contexts/UserContext";
import { DetailedOrderEntry, getOrderStatusLabel, OrderList } from "@/lib/types/orderTypes";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    marketingPageContainer,
    marketingPageContent,
    marketingPageText,
    marketingPageTitle,
} from "@/components/site/marketingPageClasses";

function mediaFromEntry(entry: DetailedOrderEntry): { path: string; alt: string } | null {
    const pozycja = entry?.pozycja;
    if (!pozycja || typeof pozycja !== "object") return null;
    const media = (pozycja as { media?: { path?: string; alt?: string }[]; nazwa?: string }).media;
    const path = media?.[0]?.path;
    if (!path) return null;
    const nazwa = (pozycja as { nazwa?: string }).nazwa ?? "Pozycja";
    return { path, alt: media?.[0]?.alt || nazwa };
}

function ThumbnailStack({
    entries,
    emptyLabel,
}: {
    entries: DetailedOrderEntry[];
    emptyLabel: string;
}) {
    if (!entries?.length) {
        return <p className="text-sm text-gray-500">{emptyLabel}</p>;
    }

    const first = mediaFromEntry(entries[0]);
    const extra = entries.length - 1;

    return (
        <div className="flex items-center gap-2">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[rgba(212,196,176,0.35)] bg-[#f8f6f3]">
                {first ? (
                    <Image
                        src={first.path}
                        alt={first.alt}
                        fill
                        className="object-cover"
                        sizes="56px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Brak
                    </div>
                )}
            </div>
            {extra > 0 && (
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#f8f6f3] px-2 text-sm font-semibold text-[#3d3329]">
                    +{extra}
                </span>
            )}
        </div>
    );
}

function OrderCard({ order }: { order: OrderList }) {
    const router = useRouter();
    const hasProducts = (order.produkty?.length ?? 0) > 0;
    const hasCourses = (order.kursy?.length ?? 0) > 0;
    const suma = Number(order.suma ?? 0);

    return (
        <button
            type="button"
            className="w-full rounded-2xl border border-[rgba(212,196,176,0.35)] bg-white/70 p-5 text-left transition-all duration-300 hover:border-[#D2B79B] hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(61,51,41,0.06)]"
            onClick={() => router.push(`/zamowienie/${order.numer_zamowienia}`)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{order.numer_zamowienia}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {formatLocaleDateTime(order.data_zamowienia ?? null)}
                    </p>
                </div>
                <div className="text-right">
                    <span className="inline-block rounded-md bg-[#f8f6f3] px-2.5 py-1 text-sm font-medium text-[#3d3329]">
                        {getOrderStatusLabel(order.status)}
                    </span>
                    <p className="mt-2 text-lg font-semibold text-[#3d3329]">
                        {suma.toFixed(2)} zł
                    </p>
                </div>
            </div>

            {hasProducts && (
                <div className="mt-4 border-t border-[rgba(212,196,176,0.25)] pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Produkty
                    </p>
                    <ThumbnailStack entries={order.produkty} emptyLabel="Brak produktów" />
                </div>
            )}

            {hasCourses && (
                <div className="mt-4 border-t border-[rgba(212,196,176,0.25)] pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Kursy
                    </p>
                    <ThumbnailStack entries={order.kursy} emptyLabel="Brak kursów" />
                </div>
            )}
        </button>
    );
}

export default function ZamowieniaPage() {
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [loading, setLoading] = useState(true);
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

    const productOrders = orders.filter((o) => (o.produkty?.length ?? 0) > 0);
    const courseOnlyOrders = orders.filter(
        (o) => (o.kursy?.length ?? 0) > 0 && (o.produkty?.length ?? 0) === 0,
    );
    const otherOrders = orders.filter(
        (o) => (o.produkty?.length ?? 0) === 0 && (o.kursy?.length ?? 0) === 0,
    );

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

                {productOrders.length > 0 && (
                    <section className="mb-10">
                        <h2 className="mb-4 text-2xl font-bold bg-gradient-to-br from-black to-[#3d3329] bg-clip-text text-transparent">
                            Produkty
                        </h2>
                        <div className="flex flex-col gap-4">
                            {productOrders.map((order) => (
                                <OrderCard key={`prod-${order._id ?? order.numer_zamowienia}`} order={order} />
                            ))}
                        </div>
                    </section>
                )}

                {courseOnlyOrders.length > 0 && (
                    <section className="mb-10">
                        <h2 className="mb-4 text-2xl font-bold bg-gradient-to-br from-black to-[#3d3329] bg-clip-text text-transparent">
                            Kursy
                        </h2>
                        <div className="flex flex-col gap-4">
                            {courseOnlyOrders.map((order) => (
                                <OrderCard key={`kurs-${order._id ?? order.numer_zamowienia}`} order={order} />
                            ))}
                        </div>
                    </section>
                )}

                {otherOrders.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-2xl font-bold bg-gradient-to-br from-black to-[#3d3329] bg-clip-text text-transparent">
                            Pozostałe
                        </h2>
                        <div className="flex flex-col gap-4">
                            {otherOrders.map((order) => (
                                <OrderCard key={`other-${order._id ?? order.numer_zamowienia}`} order={order} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
