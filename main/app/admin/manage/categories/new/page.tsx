"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import CategoryFormFields, {
    CategoryFormData,
} from "@/components/admin/CategoryFormFields";
import { useCategoryParentOptions } from "@/components/admin/hooks/useCategoryParentOptions";

const formCls =
    "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]";

export default function NewCategoryPage() {
    const router = useRouter();
    const { mainCategories, existingCategories } = useCategoryParentOptions();
    const [categoryData, setCategoryData] = useState<CategoryFormData>({
        nazwa: "",
        slug: "",
        type: "product",
        kategoria: "",
        nowa_nazwa: "",
    });

    const sendNewCategory = async () => {
        const slug = generateSlug(categoryData.nazwa);
        try {
            const response = await fetch("/admin/api/v1/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nazwa: categoryData.nazwa,
                    slug,
                    type: categoryData.type,
                    kategoria: categoryData.nowa_nazwa
                        ? categoryData.nowa_nazwa
                        : categoryData.kategoria,
                }),
            });
            const result = await response.json();
            if (result.status === 200) {
                alert("Kategoria została dodana pomyślnie!");
                router.push("/admin/manage/categories");
            } else {
                alert(
                    "Błąd podczas dodawania kategorii: " +
                        (result.error ?? result.details ?? "Nieznany błąd"),
                );
            }
        } catch (err) {
            console.error("Błąd podczas dodawania kategorii:", err);
            alert("Błąd podczas dodawania kategorii: brak połączenia lub błąd sieci.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
                        Dodaj kategorię
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Uzupełnij informacje o kategorii.
                    </p>
                </div>
                <Link
                    href="/admin/manage/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-black hover:bg-[var(--primary-light)]/50">
                    <ArrowLeft className="h-4 w-4" />
                    Anuluj
                </Link>
            </div>

            <form
                className="grid gap-5 rounded-xl border border-[var(--border)] bg-white/90 p-5 shadow-sm sm:p-6 sm:grid-cols-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendNewCategory();
                }}>
                <CategoryFormFields
                    categoryData={categoryData}
                    onChange={setCategoryData}
                    mainCategories={mainCategories}
                    existingCategories={existingCategories}
                    formCls={formCls}
                />
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-[var(--primary-dark)] hover:text-white">
                        <Save className="h-4 w-4" />
                        Zapisz kategorię
                    </button>
                </div>
            </form>
        </div>
    );
}
