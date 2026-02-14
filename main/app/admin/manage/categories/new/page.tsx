"use client";

import { useEffect, useState } from "react";
import "@/app/globals2.css";
import { makeSlugKeys, parseSlugName } from "@/lib/utils_admin";
import { Categories } from "@/lib/types/shared";

export default function NewProductPage() {
    const [nazwa, setNazwa] = useState<string>("");
    const [existingCategories, setExistingCategories] =
        useState<Record<string, Categories[]>>();
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/category", {
                    method: "GET",
                });
                const {
                    status,
                    categories,
                }: {
                    status: number;
                    categories: Record<string, Categories[]>;
                } = await response.json();
                console.log(categories);
                if (status === 0 && categories) {
                    setExistingCategories(categories);
                    setCategories(makeSlugKeys(categories));
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchProducts();
    }, []);

    const sendNewProduct = () => {};

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
                        value={nazwa}
                        onChange={(v) => {
                            setNazwa(v.target.value);
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
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                        <option>Wybierz kategorię</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {parseSlugName(category)}
                            </option>
                        ))}
                        <option value={"dodaj-nowa"}>
                            Dodaj nową kategorie
                        </option>
                    </select>
                    {selectedCategory == "dodaj-nowa" && (
                        <input
                            value={nazwa}
                            onChange={(v) => {
                                setNazwa(v.target.value);
                            }}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Np. Kosmetyk"
                        />
                    )}
                    {selectedCategory != "dodaj-nowe" &&
                        selectedCategory != "" && (
                            <div>
                                <p>Już istniejące kategorie:</p>
                                {existingCategories![selectedCategory].map(
                                    (cats) => (
                                        <div key={cats.nazwa}>{cats.nazwa}</div>
                                    )
                                )}
                            </div>
                        )}
                </div>

                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz kategorie
                    </button>
                </div>
            </form>
        </div>
    );
}
