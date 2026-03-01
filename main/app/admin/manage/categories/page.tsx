"use client";

import { Categories } from "@/lib/types/shared";
import { useEffect, useState } from "react";
import AdminCategoryCard from "@/components/admin/AdminCategoryCard";
import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Categories[] | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/admin/api/v1/category", {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setCategories(JSON.parse(data.categories));
        } catch (error) {
            console.error("Błąd podczas pobierania kategorii:", error);
            setCategories(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;
        try {
            const res = await fetch(
                `/admin/api/v1/category?slug=${encodeURIComponent(slug)}`,
                { method: "DELETE", credentials: "include" }
            );
            const data = await res.json();
            if (data.status === 0) {
                await fetchCategories();
            } else {
                alert("Błąd podczas usuwania: " + (data.error || "Nieznany błąd"));
            }
        } catch (e) {
            console.error(e);
            alert("Błąd połączenia.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary-dark)]" />
                    <p className="mt-4 text-muted-foreground">Ładowanie kategorii...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-gray-900 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-3xl">
                        <FolderTree className="h-8 w-8 text-[var(--primary-dark)]" />
                        Kategorie
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Zarządzaj głównymi kategoriami i podkategoriami katalogu.
                    </p>
                </div>
                <Link
                    href="/admin/manage/categories/new"
                    className="text-gray-900 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--primary)] px-4 py-3 text-sm font-medium text-[var(--text-dark)] shadow-sm transition-all hover:bg-[var(--primary-dark)] hover:text-white sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Dodaj kategorię
                </Link>
            </div>

            {categories && categories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {categories.map((val) => (
                        <AdminCategoryCard
                            key={val._id ?? val.slug}
                            category={val}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : categories && categories.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-white/80 p-12 text-center shadow-sm">
                    <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/60" />
                    <p className="mt-4 font-medium text-[var(--text-dark)]">Brak kategorii</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Dodaj pierwszą kategorię, aby uporządkować produkty i kursy.
                    </p>
                    <Link
                        href="/admin/manage/categories/new"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--primary-light)]/50 px-4 py-2 text-sm font-medium text-[var(--primary-dark)] hover:bg-[var(--primary)]/30"
                    >
                        <Plus className="h-4 w-4" />
                        Dodaj kategorię
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center">
                    <p className="font-medium text-red-800">Błąd podczas ładowania kategorii.</p>
                    <p className="mt-1 text-sm text-red-600">Sprawdź połączenie i odśwież stronę.</p>
                </div>
            )}
        </div>
    );
}
