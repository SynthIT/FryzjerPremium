"use client";
import AdminOrderEntry from "@/components/admin/AdminOrderEntry";
import { OrderList } from "@/lib/types/userTypes";
import { useState } from "react";
import { useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch("/admin/api/v1/orders", {
        credentials: "include",
      });
      const data = await res.json();
      setOrders(JSON.parse(data.orders));
      setLoading(false);
    }
    fetchOrders();
  }, []);

  if (loading) return <div>Ładowanie...</div>;

  return (
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
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <h2 className="text-sm font-medium sm:text-base">Ostatnie zamówienia</h2>
          <button className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">Filtry</button>
        </div>
        <div className="border-t p-3 text-xs text-muted-foreground sm:p-4 sm:text-sm">
          <table className="w-full border-1">
            <thead >
              <tr>
                <th className="border-1 p-2 m-3 text-md text-gray-800 w-1/10">Data</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Numer zamówienia</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/8">Klient</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Produkty</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Kursy</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/14">Suma</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/12">Status</th>
                <th className="border-1 p-2 m-2 text-md text-gray-800 w-1/6">Akcje</th>
              </tr>
            </thead>
            <tbody className="border-1 gap-2">
              {orders.map((order) => (
                <AdminOrderEntry key={order._id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


