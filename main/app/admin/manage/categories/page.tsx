"use client";

import { Categories } from "@/lib/types/shared";
import { useEffect, useState } from "react";
import AdminCategoryCard from "@/components/admin/AdminCategoryCard";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Categories[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/category", {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = await response.json();
                setCategories(JSON.parse(data.categories));
                console.log(data.categories);
                setLoading(false);
            } catch (error) {
                console.error("Błąd podczas pobierania kategorii:", error);
                setCategories(null);
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
                        Ładowanie kategorii...
                    </p>
                </div>
            </div>
        );
    }


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
                categories.map((val) => (
                    <AdminCategoryCard
                        key={val._id}
                        category={val}
                        onClick={() => { }}></AdminCategoryCard>
                ))
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
