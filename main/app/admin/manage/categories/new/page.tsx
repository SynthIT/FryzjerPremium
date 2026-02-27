"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { Categories, Media } from "@/lib/types/shared";
import { useRouter } from "next/navigation";

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
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj kategorie
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij informacje o kategorii.
                </p>
            </div>

            <form
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2"
                onSubmit={(e) => {
                    e.preventDefault();
                }}>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Podkategoria</label>
                    <input
                        value={categoryData.nazwa}
                        onChange={(v) => {
                            setCategoryData({ ...categoryData, nazwa: v.target.value });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Szampon wygładzający"
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Kategoria główna
                    </label>
                    <select
                        value={categoryData.kategoria}
                        onChange={(e) => setCategoryData({ ...categoryData, kategoria: e.target.value })}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
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
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Np. Kosmetyk"
                        />
                    )}
                    {categoryData.kategoria != "dodaj-nowa" &&
                        categoryData.kategoria != "" &&
                        existingCategories?.[categoryData.kategoria] && (
                            <div>
                                <p>Już istniejące kategorie:</p>
                                {existingCategories[categoryData.kategoria].map(
                                    (cats) => (
                                        <div key={cats._id ?? cats.slug}>{cats.nazwa}</div>
                                    )
                                )}
                            </div>
                        )}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Typ kategorii</label>
                    <select
                        value={categoryData.type}
                        onChange={(e) =>
                            setCategoryData({
                                ...categoryData,
                                type: e.target.value as "product" | "course",
                            })
                        }
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option value="product">Produkt</option>
                        <option value="course">Kurs</option>
                    </select>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={imageEnabled}
                            onChange={(e) => setImageEnabled(e.target.checked)}
                        />
                        Obraz kategorii (opcjonalnie)
                    </label>
                    {imageEnabled && (
                        <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                            <div className="grid gap-1 sm:col-span-2">
                                <label className="text-xs font-medium">Nazwa</label>
                                <input
                                    value={image.nazwa}
                                    onChange={(e) =>
                                        setImage({ ...image, nazwa: e.target.value })
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
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
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
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
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
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
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
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
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
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
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz kategorie
                    </button>
                </div>
            </form>
        </div>
    );
}
