"use client";

import { makeSlugKeys, parseSlugName } from "@/lib/utils_admin";
import { Categories } from "@/lib/models/Products";
import { useEffect, useState } from "react";
import AdminCategoryCard from "@/components/admin/AdminCategoryCard";

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState<Record<string, Categories[]>>();

    const [categoriesSlug, setCategoriesSlug] = useState<string[]>();
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
                const {
                    status,
                    categories,
                }: {
                    status: number;
                    categories: Record<string, Categories[]>;
                } = data;
                console.log(categories);
                if (status === 0 && categories) {
                    setCategories(categories);
                    setCategoriesSlug(makeSlugKeys(categories));
                } else {
                    setCategories({});
                    setCategoriesSlug([]);
                }
            } catch (error) {
                console.error("Błąd podczas pobierania kategorii:", error);
                setCategories({});
                setCategoriesSlug([]);
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
            {categories && categoriesSlug && categoriesSlug.length > 0 ? (
                categoriesSlug.map((val) => (
                    <div key={val}>
                        <p className="font-semibold text-lg mb-2">{parseSlugName(val)}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {categories[val]?.map((cat, index) => (
                                <AdminCategoryCard
                                    key={cat._id || `${val}-${index}`}
                                    category={cat}
                                    onClick={() => {}}></AdminCategoryCard>
                            ))}
                        </div>
                    </div>
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
