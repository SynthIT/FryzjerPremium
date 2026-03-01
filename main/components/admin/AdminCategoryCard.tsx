"use client";

import { Categories } from "@/lib/types/shared";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Package, BookOpen } from "lucide-react";

interface AdminCategoryCardProps {
    category: Categories;
    onDelete?: (slug: string) => void;
}

export default function AdminCategoryCard({
    category,
    onDelete,
}: AdminCategoryCardProps) {
    const hasImage = category.image?.path;
    const typeLabel = category.type === "course" ? "Kurs" : "Produkt";

    return (
        <div className="group rounded-xl border border-[var(--border)] bg-white/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--primary-dark)]/40 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-stretch">
                {/* Lewa część: ikona/obraz lub placeholder */}
                <div className="flex h-24 min-w-[6rem] items-center justify-center bg-[var(--primary-light)]/30 sm:h-auto sm:w-32">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/50 text-[var(--primary-dark)]">
                        {category.type === "course" ? (
                            <BookOpen className="h-6 w-6" />
                        ) : (
                            <Package className="h-6 w-6" />
                        )}
                    </span>

                </div>

                {/* Środek: dane */}
                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                    <div>
                        <h3 className="font-semibold text-[var(--text-dark)] line-clamp-2">
                            {category.nazwa || "Brak nazwy"}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Kategoria główna: {category.kategoria || "—"}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/20 px-2 py-0.5 text-xs font-medium text-[var(--primary-dark)]">
                            {typeLabel}
                        </span>
                    </div>

                    {/* Akcje */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-light)]">
                        <Link
                            href={`/admin/manage/categories/${encodeURIComponent(category.slug)}/edit`}
                            className="text-gray-900 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--primary-light)]/50 hover:border-[var(--primary)]"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edytuj
                        </Link>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(category.slug)}
                                className="inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                            >
                                Usuń
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
