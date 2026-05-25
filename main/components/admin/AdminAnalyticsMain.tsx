import { useAnalists } from "@/lib/analists/analists";
import { useEffect, useState } from "react";
import { OrderList } from "@/lib/types/userTypes";
import AnalyticsChartElement from "./AnalyticsChartElement";
import AdminAnalyticsCharts from "./AdminAnalyticsCharts";
import AdminAnalyticsTable from "./AdminAnalyticsTable";
import { Analist } from "@/lib/types/analistTypes";

export default function AdminAnalyticsEntry() {
    const [orders, setOrders] = useState<OrderList[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<number>(1);
    const [analists, setAnalists] = useState<Analist[]>([]);
    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/admin/api/v1/main", {
                credentials: "include",
            });
            const data = await res.json();
            setOrders(JSON.parse(data.orders));
            setAnalists(JSON.parse(data.analists));
            setLoading(false);
        }
        fetchData();
    }, []);
    const { overallRevenueFromProducts, overallProfitFromProducts, overallRevenueFromCourses, overallProfitFromCourses, soldProductNameInMonth } =
        useAnalists(orders, analists);

    if (loading) return <div className="flex items-center justify-center h-full" >Ładowanie...</div>;
    return (
        <div className="space-y-6">
            <div className="mb-5 pb-5">
                <div className="rounded-lg border p-4 lg:col-span-2">
                    <div className="rounded-lg border p-4 lg:col-span-2">
                        <AdminAnalyticsCharts>
                            <AnalyticsChartElement title="Przychód" produkty={overallRevenueFromProducts} kursy={overallRevenueFromCourses} />
                            <AnalyticsChartElement title="Zysk" produkty={overallProfitFromProducts} kursy={overallProfitFromCourses} />
                        </AdminAnalyticsCharts>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-base font-medium">Sprzedaż w liczbach</h2>
                <div className="flex flex-row items-center justify-between gap-4 p-2 border-b border-gray-200">
                    <p>Dostosuj widok do swoich potrzeb</p>
                    <select onChange={(e) => setRange(Number(e.target.value))} className="border rounded-md p-2">
                        <option value="1">Sprzedaż na przestrzeni ostatniego miesiąca</option>
                        <option value="3">Sprzedaż na przestrzeni ostatniego 3 miesięcy</option>
                        <option value="6">Sprzedaż na przestrzeni ostatniego 6 miesięcy</option>
                    </select>
                </div>
                <AdminAnalyticsTable data={soldProductNameInMonth(range)} config={range} />
            </div>
        </div>
    )
}