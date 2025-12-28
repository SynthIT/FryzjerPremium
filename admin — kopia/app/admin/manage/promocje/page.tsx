"use client";

import { useEffect, useState } from "react";
import { Promos } from "@/lib/models/Products";
import AdminPromoCard from "@/components/admin/AdminPromoCard";

export default function ProductsPage() {
    const [promocje, setPromo] = useState<Promos[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchPromo() {
            try {
                setLoading(true);
                const response = await fetch("/admin/api/v1/promo", {
                    method: "GET",
                });
                const {
                    status,
                    promos,
                }: { status: number; promos?: Promos[] } =
                    await response.json();
                if (status == 0) {
                    setLoading(false);
                    setPromo(promos!);
                } else {
                    setLoading(false);

                    throw new Error("");
                }
            } catch (error) {
                setLoading(false);
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchPromo();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie promocji...
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
                        Promocje
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj promocje.
                    </p>
                </div>
                <a
                    href="/admin/manage/promocje/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj promocje
                </a>
            </div>

            {promocje ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {promocje.map((val, index) => {
                            return (
                                <AdminPromoCard
                                    key={index}
                                    promo={val}
                                    onClick={() => null}></AdminPromoCard>
                            );
                        })}
                    </div>
                </>
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
