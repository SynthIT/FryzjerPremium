"use client";

import { useState } from "react";
import "@/app/globals2.css";

export default function NewProductPage() {
    const [nazwa, setNazwa] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

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
                        <option value={"dodaj-nowa"}>
                            Dodaj nową kategorie
                        </option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
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
