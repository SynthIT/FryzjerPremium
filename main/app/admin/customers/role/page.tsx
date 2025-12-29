"use client";

import { useEffect, useState } from "react";
import { Producents, Products } from "@/lib/models/Products";

export default function ProductsPage() {
    const [producent, setProducent] = useState<Producents[]>([]);
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/products", {
                    method: "GET",
                });
                const data: Products[] = await response.json();
                console.log("Pobrane produkty:", data);

                const producents = new Set<string>();
                data.forEach((product) =>
                    producents.add(
                        JSON.stringify(product.producent as Producents)
                    )
                );
                console.log("Unikalni producenci:", producents);
                const producentsArray: Producents[] = Array.from(
                    producents
                ).map((prod) => JSON.parse(prod));
                setProducent(producentsArray);
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
                        Produkty
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj produkty.
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
