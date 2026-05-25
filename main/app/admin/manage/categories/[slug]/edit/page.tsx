"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { Categories } from "@/lib/types/shared";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import CategoryFormFields, {
    CategoryFormData,
} from "@/components/admin/CategoryFormFields";
import { useCategoryParentOptions } from "@/components/admin/hooks/useCategoryParentOptions";

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slugParam = typeof params?.slug === "string" ? params.slug : "";
    const { mainCategories, existingCategories, loading: optionsLoading } =
        useCategoryParentOptions();

    const [categoryData, setCategoryData] = useState<CategoryFormData | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch("/admin/api/v1/category", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                const dataParsed = JSON.parse(data.categories) as Categories[];
                if (data.status !== 0 || !dataParsed?.length) return;

                const current = dataParsed.find(
                    (c) =>
                        c.slug === slugParam ||
                        decodeURIComponent(c.slug || "") === slugParam,
                );
                if (current) {
                    setCategoryData({
                        _id: current._id,
                        nazwa: current.nazwa,
                        slug: current.slug,
                        type: current.type,
                        kategoria: current.kategoria ?? "",
                        nowa_nazwa: "",
                    });
                }
            } catch (e) {
                console.error("Błąd ładowania kategorii:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slugParam]);

    const saveCategory = async () => {
        if (!categoryData?._id) return;
        setSaving(true);
        const payload = {
            _id: categoryData._id,
            nazwa: categoryData.nazwa,
            slug: generateSlug(categoryData.nazwa),
            type: categoryData.type,
            kategoria: categoryData.nowa_nazwa || categoryData.kategoria,
        };
        try {
            const response = await fetch("/admin/api/v1/category", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.status === 200) {
                router.push("/admin/manage/categories");
            } else {
                alert("Błąd: " + (result.error ?? result.details ?? "Nieznany błąd"));
            }
        } catch (err) {
            console.error(err);
            alert("Błąd połączenia.");
        } finally {
            setSaving(false);
        }
    };

    const formCls =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-400 focus:border-gray-500";

    if (loading || optionsLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </div>
        );
    }

    if (!categoryData) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 text-center">
                <p className="font-medium text-amber-800">Nie znaleziono kategorii.</p>
                <Link
                    href="/admin/manage/categories"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-amber-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Wróć do listy
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Edytuj kategorię
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Zmień dane kategorii &quot;{categoryData.nazwa}&quot;.
                    </p>
                </div>
                <Link
                    href="/admin/manage/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100">
                    <ArrowLeft className="h-4 w-4" />
                    Anuluj
                </Link>
            </div>

            <form
                className="grid gap-5 rounded-xl border border-gray-300 bg-white p-5 shadow-sm sm:p-6 sm:grid-cols-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    saveCategory();
                }}>
                <CategoryFormFields
                    categoryData={categoryData}
                    onChange={setCategoryData}
                    mainCategories={mainCategories}
                    existingCategories={existingCategories}
                    formCls={formCls}
                    nameLabel="Nazwa (podkategoria)"
                />
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60">
                        <Save className="h-4 w-4" />
                        {saving ? "Zapisywanie…" : "Zapisz zmiany"}
                    </button>
                </div>
            </form>
        </div>
    );
}
