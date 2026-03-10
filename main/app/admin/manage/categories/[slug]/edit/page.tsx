"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { Categories, Media } from "@/lib/types/shared";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type CategoryFormData = Omit<
    Categories,
    "__v" | "createdAt" | "updatedAt"
> & {
    nowa_nazwa?: string;
};

const emptyImage: Media = {
    nazwa: "",
    slug: "",
    typ: "image",
    alt: "",
    path: "",
};

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slugParam = typeof params?.slug === "string" ? params.slug : "";

    const [categoryData, setCategoryData] = useState<CategoryFormData | null>(null);
    const [imageEnabled, setImageEnabled] = useState(false);
    const [image, setImage] = useState<Media>(emptyImage);
    const [categories, setCategories] = useState<string[]>([]);
    const [existingCategories, setExistingCategories] = useState<Record<string, Categories[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch("/admin/api/v1/category", { method: "GET" });
                const data = await response.json();
                const dataParsed = JSON.parse(data.categories) as Categories[];
                if (data.status !== 0 || !dataParsed?.length) {
                    setLoading(false);
                    return;
                }
                setExistingCategories(
                    dataParsed.reduce((acc: Record<string, Categories[]>, cat: Categories) => {
                        (acc[cat.kategoria] ??= []).push(cat);
                        return acc;
                    }, {})
                );
                const mainCats = dataParsed.reduce((acc: string[], cat: Categories) => {
                    if (cat.kategoria && !acc.includes(cat.kategoria)) acc.push(cat.kategoria);
                    return acc;
                }, []);
                setCategories(mainCats);

                const current = dataParsed.find(
                    (c) => c.slug === slugParam || decodeURIComponent(c.slug || "") === slugParam
                );
                if (current) {
                    setCategoryData({
                        _id: current._id,
                        nazwa: current.nazwa,
                        slug: current.slug,
                        type: current.type,
                        kategoria: current.kategoria ?? "",
                        image: current.image,
                        nowa_nazwa: "",
                    });
                    if (current.image?.path) {
                        setImageEnabled(true);
                        setImage(current.image);
                    }
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
        const newSlug = generateSlug(categoryData.nazwa);
        const payload = {
            _id: categoryData._id,
            nazwa: categoryData.nazwa,
            slug: newSlug,
            type: categoryData.type,
            kategoria: categoryData.nowa_nazwa || categoryData.kategoria,
            image: imageEnabled ? image : undefined,
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

    if (loading) {
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
                    className="mt-4 inline-flex items-center gap-2 text-sm text-amber-700 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Wróć do listy
                </Link>
            </div>
        );
    }

    const formCls =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-400 focus:border-gray-500";

    return (
        <div className="space-y-6 text-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                        Edytuj kategorię
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Zmień dane kategorii &quot;{categoryData.nazwa}&quot;.
                    </p>
                </div>
                <Link
                    href="/admin/manage/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Anuluj
                </Link>
            </div>

            <form
                className="grid gap-5 rounded-xl border border-gray-300 bg-white p-5 shadow-sm sm:p-6 sm:grid-cols-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    saveCategory();
                }}
            >
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-900">Nazwa (podkategoria)</label>
                    <input
                        value={categoryData.nazwa}
                        onChange={(e) => setCategoryData({ ...categoryData, nazwa: e.target.value })}
                        className={formCls}
                        placeholder="Np. Szampon wygładzający"
                    />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-900">Kategoria główna</label>
                    <select
                        value={categoryData.kategoria}
                        onChange={(e) => setCategoryData({ ...categoryData, kategoria: e.target.value })}
                        className={formCls}
                    >
                        <option value="">Wybierz kategorię</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                        <option value="dodaj-nowa">Dodaj nową kategorię główną</option>
                    </select>
                    {categoryData.kategoria === "dodaj-nowa" && (
                        <input
                            value={categoryData.nowa_nazwa ?? ""}
                            onChange={(e) =>
                                setCategoryData({ ...categoryData, nowa_nazwa: e.target.value })
                            }
                            className={formCls}
                            placeholder="Nazwa nowej kategorii głównej"
                        />
                    )}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-900">Typ kategorii</label>
                    <select
                        value={categoryData.type}
                        onChange={(e) =>
                            setCategoryData({
                                ...categoryData,
                                type: e.target.value as "product" | "course",
                            })
                        }
                        className={formCls}
                    >
                        <option value="product">Produkt</option>
                        <option value="course">Kurs</option>
                    </select>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <input
                            type="checkbox"
                            checked={imageEnabled}
                            onChange={(e) => setImageEnabled(e.target.checked)}
                        />
                        Obraz kategorii (opcjonalnie)
                    </label>
                    {imageEnabled && (
                        <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-900">Nazwa</label>
                                <input
                                    value={image.nazwa}
                                    onChange={(e) => setImage({ ...image, nazwa: e.target.value })}
                                    className={formCls}
                                    placeholder="Np. Ikona kategorii"
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-medium text-gray-900">Slug (opcjonalny)</label>
                                <input
                                    value={image.slug}
                                    onChange={(e) => setImage({ ...image, slug: e.target.value })}
                                    className={formCls}
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-medium text-gray-900">Typ</label>
                                <select
                                    value={image.typ}
                                    onChange={(e) =>
                                        setImage({ ...image, typ: e.target.value as Media["typ"] })
                                    }
                                    className={formCls}
                                >
                                    <option value="image">image</option>
                                    <option value="video">video</option>
                                    <option value="pdf">pdf</option>
                                    <option value="other">other</option>
                                </select>
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-900">Alt (tekst alternatywny)</label>
                                <input
                                    value={image.alt}
                                    onChange={(e) => setImage({ ...image, alt: e.target.value })}
                                    className={formCls}
                                    placeholder="Opis obrazu"
                                />
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium text-gray-900">Ścieżka (path)</label>
                                <input
                                    value={image.path}
                                    onChange={(e) => setImage({ ...image, path: e.target.value })}
                                    className={formCls}
                                    placeholder="Np. /images/cat-icon.png"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-900 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Zapisywanie…" : "Zapisz zmiany"}
                    </button>
                </div>
            </form>
        </div>
    );
}
