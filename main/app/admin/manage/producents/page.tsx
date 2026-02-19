"use client";

import { useEffect, useState } from "react";
import { Producents } from "@/lib/types/productTypes";
import AdminProducentCard from "@/components/admin/AdminProducentCard";

export default function ProductsPage() {
    const [producents, setProducents] = useState<Producents[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/producents", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                setProducents(data.producents);
                setLoading(false);
            } catch (error) {
                console.error("Błąd podczas pobierania producentów:", error);
                setProducents([]);
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie producentów...
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Producenci
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj producentów.{" "}
                        <span style={{ color: "red" }}>Uwaga:</span> Usunięcie
                        producenta spowoduje usunięcie wszystkich skojarzonych z
                        nim produktów. Po wykonaniu tej operacji zsotanie
                        ustworzony plik backupowy.
                    </p>
                </div>
                <a
                    href="/admin/manage/producents/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj producenta
                </a>
            </div>

            {producents && producents.length > 0 ? (
                producents.map((val) => (
                    <AdminProducentCard
                        key={val._id}
                        producent={val}
                        onClick={() => { }}></AdminProducentCard>
                ))
            ) : (
                <div className="rounded-lg border">
                    <div className="p-4 text-sm text-muted-foreground">
                        Brak producentów.
                    </div>
                </div>
            )}
        </div>
    );
}
