"use client";

import { Categories, Products } from "@/lib/models/Products";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Categories[]>([]);
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/products", {
                    method: "GET",
                });
                const data: Products[] = await response.json();
                console.log("Pobrane produkty:", data);
                const categoriesSet = new Set<string>();
                data.forEach((product) =>
                    (product.kategoria as Categories[]).forEach((category) =>
                        categoriesSet.add(JSON.stringify(category))
                    )
                );
                console.log("Unikalne kategorie:", categoriesSet);
                const categoriesArray: Categories[] = Array.from(
                    categoriesSet
                ).map((cat) => JSON.parse(cat));
                setCategories(categoriesArray);
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchProducts();
    }, []);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kategorie
                    </h1>
                    <p className="text-muted-foreground">
                        Zarządzaj głównymi kategoriami katalogu.
                    </p>
                </div>
                <a
                    href="/admin/manage/categories/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj produkt
                </a>
            </div>
            {categories ? (
                categories.map((val, index) => {
                    return (
                        <div key={index} className="rounded-lg border">
                            <div className="p-4 text-sm text-muted-foreground">
                                Nazwa kategorii: {val.nazwa}
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
