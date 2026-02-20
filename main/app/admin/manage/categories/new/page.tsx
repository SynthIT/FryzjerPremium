"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { generateSlug, makeSlugKeys, parseSlugName } from "@/lib/utils_admin";
import { Categories } from "@/lib/types/shared";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
    const router = useRouter();
    const [categoryData, setCategoryData] = useState({
        nazwa: "",
        slug: "",
        type: "product",
        nowa_nazwa: "",
        kategoria: "",
    });
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
            alert("Błąd podczas dodawania kategorii: " + result.error);
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

            <form className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
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
                        onChange={(e) => setCategoryData({ ...categoryData, kategoria: e.target.value })}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option>Wybierz kategorię</option>
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
                        categoryData.kategoria != "" && (
                            <div>
                                <p>Już istniejące kategorie:</p>
                                {existingCategories![categoryData.kategoria].map(
                                    (cats) => (
                                        <div key={cats._id}>{cats.nazwa}</div>
                                    )
                                )}
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
