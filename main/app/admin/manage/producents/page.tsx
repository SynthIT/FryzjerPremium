"use client";

import { useEffect, useState } from "react";
import { Producents, Products } from "@/lib/models/Products";

export default function ProductsPage() {
    const [producent, setProducent] = useState<Producents[]>([]);
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/producents", {
                    method: "GET",
                    credentials: "include",
                });
                const {
                    status,
                    producents,
                }: { status: number; producents: Producents[] } =
                    await response.json();
                if (status == 0 && producents) {
                    setProducent(producents);
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchProducts();
    }, []);
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

            {producent ? (
                producent.map((val, index) => {
                    return (
                        <div key={index} className="rounded-lg border">
                            <div className="p-4 text-sm text-muted-foreground">
                                Nazwa producenta: {val.nazwa}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="rounded-lg border">
                    <div className="p-4 text-sm text-muted-foreground">
                        Błąd podczas generowania strony z produktami.
                    </div>
                </div>
            )}
        </div>
    );
}
