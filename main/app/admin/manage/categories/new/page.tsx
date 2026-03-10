"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { Categories, Media } from "@/lib/types/shared";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";

/** Pola formularza zgodne z Categories (bez pól mongo: _id, __v, createdAt, updatedAt) */
type CategoryFormData = Omit<
    Categories,
    "_id" | "__v" | "createdAt" | "updatedAt"
> & {
    /** Tylko w formularzu: nazwa nowej kategorii głównej gdy wybrano "dodaj-nowa" */
    nowa_nazwa?: string;
};

const emptyImage: Media = {
    nazwa: "",
    slug: "",
    typ: "image",
    alt: "",
    path: "",
};

const formCls =
    "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-dark)] outline-none transition focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]";

export default function NewCategoryPage() {
    const router = useRouter();
    const [categoryData, setCategoryData] = useState<CategoryFormData>({
        nazwa: "",
        slug: "",
        type: "product",
        kategoria: "",
        nowa_nazwa: "",
    });
    const [imageEnabled, setImageEnabled] = useState(false);
    const [image, setImage] = useState<Media>(emptyImage);
    const [categories, setCategories] = useState<string[]>([]);
    const [existingCategories, setExistingCategories] =
        useState<Record<string, Categories[]>>();


    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/admin/api/v1/category", {
                    method: "GET",
                });
                const data = await response.json();
                const dataParsed = JSON.parse(data.categories) as Categories[];
                if (data.status === 0 && data.categories) {
                    setExistingCategories(dataParsed.reduce((acc: Record<string, Categories[]>, cat: Categories) => {
                        (acc[cat.kategoria] ??= []).push(cat);
                        return acc;
                    }, {}));
                    setCategories(dataParsed.reduce((acc: string[], cat: Categories) => {
                        if (!acc.includes(cat.kategoria)) {
                            acc.push(cat.kategoria);
                        }
                        return acc;
                    }, []));
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchCategories();
    }, []);

    const sendNewCategory = async () => {
        categoryData.slug = generateSlug(categoryData.nazwa);
        try {
            const response = await fetch("/admin/api/v1/category", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    nazwa: categoryData.nazwa,
                    slug: categoryData.slug,
                    type: categoryData.type,
                    kategoria: categoryData.nowa_nazwa ? categoryData.nowa_nazwa : categoryData.kategoria,
                }),
            });
            const result = await response.json();
            if (result.status === 200) {
                alert("Kategoria została dodana pomyślnie!");
                router.push("/admin/manage/categories");
            } else {
                alert("Błąd podczas dodawania kategorii: " + (result.error ?? result.details ?? "Nieznany błąd"));
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
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-2xl">
                        <Plus className="h-6 w-6 text-[var(--primary-dark)]" />
                        Dodaj kategorię
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Uzupełnij informacje o kategorii.
                    </p>
                </div>
                <Link
                    href="/admin/manage/categories"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-dark)] hover:bg-[var(--primary-light)]/50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Anuluj
                </Link>
            </div>

            <form
                className="grid gap-5 rounded-xl border border-[var(--border)] bg-white/90 p-5 shadow-sm sm:p-6 sm:grid-cols-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendNewCategory();
                }}
            >
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-dark)]">Podkategoria</label>
                    <input
                        value={categoryData.nazwa}
                        onChange={(v) => {
                            setCategoryData({ ...categoryData, nazwa: v.target.value });
                        }}
                        className={formCls}
                        placeholder="Np. Szampon wygładzający"
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-dark)]">
                        Kategoria główna
                    </label>
                    <select
                        value={categoryData.kategoria}
                        onChange={(e) => setCategoryData({ ...categoryData, kategoria: e.target.value })}
                        className={formCls}
                    >
                        <option value="">Wybierz kategorię</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                        <option value={"dodaj-nowa"}>
                            Dodaj nową kategorie
                        </option>
                    </select>
                    {categoryData.kategoria == "dodaj-nowa" && (
                        <input
                            value={categoryData.nowa_nazwa}
                            onChange={(v) => {
                                setCategoryData({ ...categoryData, nowa_nazwa: v.target.value });
                            }}
                            className={formCls}
                            placeholder="Np. Kosmetyk"
                        />
                    )}
                    {categoryData.kategoria != "dodaj-nowa" &&
                        categoryData.kategoria != "" &&
                        existingCategories?.[categoryData.kategoria] && (
                            <div className="mt-2 rounded-lg border border-[var(--border-light)] bg-[var(--background)]/30 p-3">
                                <p className="text-xs font-medium text-muted-foreground">Istniejące podkategorie w tej kategorii:</p>
                                <ul className="mt-1 flex flex-wrap gap-2">
                                    {existingCategories[categoryData.kategoria].map(
                                        (cats) => (
                                            <li key={cats._id ?? cats.slug} className="text-sm text-[var(--text-dark)]">{cats.nazwa}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-dark)]">Typ kategorii</label>
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
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-dark)]">
                        <input
                            type="checkbox"
                            checked={imageEnabled}
                            onChange={(e) => setImageEnabled(e.target.checked)}
                        />
                        Obraz kategorii (opcjonalnie)
                    </label>
                    {imageEnabled && (
                        <div className="grid gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--background)]/30 p-4 sm:grid-cols-2">
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium">Nazwa</label>
                                <input
                                    value={image.nazwa}
                                    onChange={(e) =>
                                        setImage({ ...image, nazwa: e.target.value })
                                    }
                                    className={formCls}
                                    placeholder="Np. Ikona kategorii"
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-medium">Slug (opcjonalny)</label>
                                <input
                                    value={image.slug}
                                    onChange={(e) =>
                                        setImage({ ...image, slug: e.target.value })
                                    }
                                    className={formCls}
                                    placeholder="Pusty = z nazwy"
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs font-medium">Typ</label>
                                <select
                                    value={image.typ}
                                    onChange={(e) =>
                                        setImage({
                                            ...image,
                                            typ: e.target.value as Media["typ"],
                                        })
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
                                <label className="text-xs font-medium">Alt (tekst alternatywny)</label>
                                <input
                                    value={image.alt}
                                    onChange={(e) =>
                                        setImage({ ...image, alt: e.target.value })
                                    }
                                    className={formCls}
                                    placeholder="Opis obrazu"
                                />
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium">Ścieżka (path)</label>
                                <input
                                    value={image.path}
                                    onChange={(e) =>
                                        setImage({ ...image, path: e.target.value })
                                    }
                                    className={formCls}
                                    placeholder="Np. /images/cat-icon.png"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <button
                        onClick={sendNewCategory}
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-dark)] shadow-sm transition hover:bg-[var(--primary-dark)] hover:text-white"
                    >
                        <Save className="h-4 w-4" />
                        Zapisz kategorię
                    </button>
                </div>
            </form>
        </div>
    );
}
