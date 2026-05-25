"use client";
import AdminOrderEntry from "@/components/admin/AdminOrderEntry";
import { OrderList } from "@/lib/types/userTypes";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";

const TOAST_DURATION = 5000;
const LIMITS = [
    10, 25, 50, 100
]

export default function OrdersPage() {
    const searchParams = useSearchParams();
    const notfound = searchParams.get("notfound");
    const nrzam = searchParams.get("nrzam");
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNotFound, setShowNotFound] = useState(!!notfound && !!nrzam);
    const [progress, setProgress] = useState(100);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const [filters, setFilters] = useState<{ limit: number, search: string, status: string }>({ limit: 10, search: "", status: "" });
    const [page, setPage] = useState(1);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        if (!showNotFound) return;

        startRef.current = performance.now();

        const tick = (now: number): void => {
            const elapsed = now - (startRef.current ?? now);
            const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                setShowNotFound(false);
                return;
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [showNotFound]);

    useEffect(() => {
        async function fetchOrders() {
            const res = await fetch("/admin/api/v1/orders", {
                credentials: "include",
            });
            const data = await res.json();
            setOrders(data.orders);
            setLoading(false);
        }
        fetchOrders();
    }, []);


    const filteredOrders = useMemo(() => orders.filter((order) => order.numer_zamowienia.toLowerCase().includes(filters.search.toLowerCase())), [orders, filters.search]);
    const ordersToShow = useMemo(() => filteredOrders.slice((page - 1) * filters.limit, page * filters.limit), [filteredOrders, filters.limit, page]);
    const totalPages = useMemo(() => Math.ceil(filteredOrders.length / filters.limit), [filteredOrders, filters.limit]);
    console.log(ordersToShow.length);
    console.log(totalPages);

    if (loading) return <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
        <p className="text-muted-foreground">Ładowanie zamówień...</p>
    </div>;

    return (
        <>
            {showNotFound && nrzam && (
                <div className="bg-red-500 text-white p-4 rounded-md absolute top-0 left-0 right-0 z-50 overflow-hidden">
                    <h2 className="text-lg font-bold">Zamówienie nie znalezione</h2>
                    <p className="text-sm">Numer zamówienia: {nrzam}</p>
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-white/40 transition-none"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            <div className="space-y-4 sm:space-y-6">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Zamówienia</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">Przeglądaj i zarządzaj zamówieniami klientów.</p>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-3 sm:p-4">
                        <div className="text-xs text-muted-foreground sm:text-sm">Dziś</div>
                        <div className="mt-2 text-xl font-semibold sm:text-2xl">18</div>
                    </div>
                    <div className="rounded-lg border p-3 sm:p-4">
                        <div className="text-xs text-muted-foreground sm:text-sm">W trakcie</div>
                        <div className="mt-2 text-xl font-semibold sm:text-2xl">12</div>
                    </div>
                    <div className="rounded-lg border p-3 sm:p-4">
                        <div className="text-xs text-muted-foreground sm:text-sm">Do wysyłki</div>
                        <div className="mt-2 text-xl font-semibold sm:text-2xl">5</div>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <div>
                        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                            <div className="flex items-center gap-1">
                                <h2 className="text-sm font-medium sm:text-base">Ostatnie zamówienia</h2>
                                <div className="flex items-center gap-1 pl-2 ml-2">
                                    <input type="text" className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto" onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Szukaj" />
                                </div>
                            </div>
                            <button className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>Filtry</button>
                        </div>
                        {isFiltersOpen && (
                            <div className="rounded-lg border-t">
                                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                    <h2 className="text-sm font-medium sm:text-base">Filtry</h2>
                                </div>
                                <div className="flex flex-row justify-between  p-3 text-xs text-foreground sm:p-4 sm:text-sm">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-1">
                                            <label htmlFor="limit" className="text-sm font-medium sm:text-base">Limit</label>
                                            <select
                                                id="limit"
                                                className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto"
                                                value={filters.limit}
                                                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                                            >
                                                {LIMITS.map((limit) => (
                                                    <option key={limit} value={limit}>{limit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-3">
                                        <label htmlFor="status" className="text-sm font-medium sm:text-base">Status</label>
                                        <select id="status" className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                            <option value="all">Wszystkie</option>
                                            <option value="pending">Oczekuje na płatność</option>
                                            <option value="paid">Opłacone</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="border-t p-3 text-xs text-muted-foreground sm:p-4 sm:text-sm">
                        <table className="w-full border-1">
                            <thead >
                                <tr>
                                    <th className="border-1 p-2 m-3 text-md text-gray-800 w-1/9">Data</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/8">Numer zamówienia</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/8">Klient</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Produkty</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Kursy</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/14">Suma</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/12">Status</th>
                                    <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="border-1 gap-2">
                                {ordersToShow.map((order) => (
                                    <AdminOrderEntry key={order._id} order={order} />
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between p-3 sm:p-4">
                            <button className={"cursor-pointer bg-blue-500 text-white rounded-md border px-3 py-2 text-sm transition-colors sm:w-auto" + (page === 1 ? " bg-gray-300 cursor-not-allowed" : " hover:bg-blue-600")} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Poprzednia</button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button key={pageNum} className={"cursor-pointer text-black rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors sm:w-auto" + (page === pageNum ? " bg-gray-300 " : " hover:bg-gray-100")} onClick={() => setPage(pageNum)} disabled={page === pageNum}>{pageNum}</button>
                                ))}
                            </div>
                            <button className={"cursor-pointer bg-blue-500 text-white rounded-md border px-3 py-2 text-sm transition-colors sm:w-auto" + (page === totalPages ? " bg-gray-300 cursor-not-allowed" : " hover:bg-blue-600")} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Następna</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}


