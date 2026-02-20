"use client";
import {
    ArrowUpRight,
    Package,
    ShoppingBag,
    DollarSign,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import "@/app/globals2.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Products } from "@/lib/types/productTypes";
import { OrderList } from "@/lib/types/userTypes";
import { Analist } from "@/lib/types/analistTypes";


export default function AdminPage() {
    const [products, setProducts] = useState<Products[]>([]);
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [analists, setAnalists] = useState<Analist[]>([]);
    const [loading, setLoading] = useState(true);
    const [bestProducts, setBestProducts] = useState<{ name: string, income: number }[]>([]);


    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/admin/api/v1/main", {
                credentials: "include",
            });
            const data = await res.json();
            setProducts(JSON.parse(data.products));
            setOrders(JSON.parse(data.orders));
            setAnalists(JSON.parse(data.analists));
            setLoading(false);
            console.log(data);
        }
        fetchData();
    }, []);

    useEffect(() => {
        const raport = Object.values(analists.reduce((acc: Record<string, { name: string, income: number }>, curr) => {
            const zysk = curr.cena - curr.cena_skupu;
            const income = zysk * curr.ilosc;
            if (!acc[curr.sku]) {
                acc[curr.sku] = { name: curr.nazwa, income: 0 };
            }
            acc[curr.sku].income += income;
            return acc;
        }, {}));
        setBestProducts(raport.sort((a, b) => b.income - a.income).slice(0, 5));
    }, [analists]);

    const lowStock = useMemo(() => {
        return products.filter((product) => {
            if (product.ilosc < 10) {
                return true;
            }
            product.wariant?.forEach((wariant) => {
                if (wariant.ilosc < 10) {
                    return true;
                }
            });
            return false;
        });
    }, [products]);
    const noStock = useMemo(() => {
        return products.filter((product) => {
            if (product.ilosc === 0) {
                return true;
            }
            product.wariant?.forEach((wariant) => {
                if (wariant.ilosc === 0) {
                    return true;
                }
            });
            return false;
        });
    }, [products]);

    const income = useMemo(() => {
        return analists.reduce((acc, curr) => acc + curr.cena * curr.ilosc, 0);
    }, [analists]);
    const sales = useMemo(() => {
        return orders.reduce((acc, curr) => acc + curr.suma, 0);
    }, [orders]);


    if (loading) {
        return <div>Ładowanie danych...</div>;
    }
    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Panel główny
            </h1>
            <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Wszystkie zamówienia"
                    value={orders.length.toString()}
                    delta="12%"
                    icon={<ShoppingBag className="h-5 w-5" />}
                />
                <KpiCard
                    title="Liczba produktów"
                    value={products.length.toString()}
                    delta="3%"
                    icon={<Package className="h-5 w-5" />}
                />
                <KpiCard
                    title="Przychód"
                    value={income.toString()}
                    delta="9%"
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <KpiCard
                    title="Sprzedaż"
                    value={sales.toString()}
                    delta="6%"
                    icon={<Wallet className="h-5 w-5" />}
                />
            </section>
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="rounded-lg border p-3 sm:p-4 lg:col-span-2">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-medium sm:text-base">
                            Przychód w czasie
                        </h2>
                        <button className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm">
                            Miesięcznie
                        </button>
                    </div>
                    <div className="h-48 w-full rounded-md bg-linear-to-br from-zinc-900/5 to-zinc-500/5 sm:h-64" />
                </div>
                <div className="rounded-lg border p-3 sm:p-4">
                    <h2 className="mb-2 text-base font-medium">
                        Najlepsze produkty
                    </h2>
                    <ul className="space-y-3 text-sm">
                        {bestProducts.length > 0 ? bestProducts.map((product, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between">
                                <span className="truncate">
                                    {product.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {product.income.toLocaleString()} zł
                                </span>
                            </li>
                        )) : <li className="flex items-center justify-between">
                            <span className="truncate">
                                Brak danych
                            </span>
                        </li>}
                    </ul>
                </div>
            </section>
            <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="rounded-lg border p-3 sm:p-4">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm font-medium sm:text-base">
                            Ostatnie zamówienia
                        </h2>
                        <a
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                            href="/orders">
                            Zobacz wszystkie
                        </a>
                    </div>
                    <div className="h-48 w-full rounded-md bg-muted sm:h-64" />
                </div>
                <div className="rounded-lg border p-3 sm:p-4">
                    <h2 className="mb-2 text-sm font-medium sm:text-base">
                        Alerty magazynowe
                    </h2>
                    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <div className="rounded-md border p-3">
                            <div className="mb-1 text-sm font-medium">
                                Niski stan
                            </div>
                            <div className="text-2xl font-semibold">{lowStock.length}</div>
                            <Link
                                className="mt-2 inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                href="/admin/manage/products?stock_lt=10">
                                Zobacz produkty{" "}
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                        <div className="rounded-md border p-3">
                            <div className="mb-1 text-sm font-medium">
                                Brak na stanie
                            </div>
                            <div className="text-2xl font-semibold">{noStock.length}</div>
                            <Link
                                className="mt-2 inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                                href="/admin/manage/products?stock=0">
                                Zobacz produkty{" "}
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function KpiCard({
    title,
    value,
    delta,
    icon,
}: {
    title: string;
    value: string;
    delta: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border p-3 transition-colors sm:p-4">
            <div className="flex items-center justify-between">
                <div className="rounded-md bg-linear-to-br from-zinc-900/10 to-zinc-500/10 p-1.5 text-foreground shadow-sm sm:p-2">
                    {icon}
                </div>
                <span className="text-xs text-muted-foreground">+{delta}</span>
            </div>
            <div className="mt-3 text-xl font-semibold sm:mt-4 sm:text-2xl">
                {value}
            </div>
            <div className="text-xs text-muted-foreground sm:text-sm">
                {title}
            </div>
        </div>
    );
}
