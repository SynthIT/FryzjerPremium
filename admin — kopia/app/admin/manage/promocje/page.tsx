"use client";

import { useEffect, useState } from "react";
import { Promos } from "@/lib/models/Products";

export default function ProductsPage() {
    const [promocje, setPromo] = useState<Promos[]>([]);
    useEffect(() => {
        async function fetchPromo() {
            try {
                const response = await fetch("/admin/api/v1/promo", {
                    method: "GET",
                });
                const {
                    status,
                    promos,
                }: { status: number; promos?: Promos[] } =
                    await response.json();
                if (status == 0) {
                    setPromo(promos!);
                } else {
                    throw new Error("");
                }
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchPromo();
    }, []);
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Promocje
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj promocje.
                    </p>
                </div>
                <a
                    href="/admin/manage/producents/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj promocje
                </a>
            </div>

            {promocje ? (
                promocje.map((val, index) => {
                    return (
                        <div key={index} className="rounded-lg border">
                            <div className="p-4 text-sm text-muted-foreground">
                                Nazwa promocji: {val.nazwa}
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
