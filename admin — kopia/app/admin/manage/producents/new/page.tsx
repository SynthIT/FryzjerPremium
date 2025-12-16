"use client";

import { useState } from "react";
import "@/app/globals2.css";

export default function NewProductPage() {
    const [nazwa, setNazwa] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const sendNewProduct = () => {};

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj produkt
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o produkcie.
                </p>
            </div>

            <form className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa</label>
                    <input
                        value={nazwa}
                        onChange={(v) => {
                            setNazwa(v.target.value);
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Szampon wygładzający"
                    />
                    <span style={{ fontSize: "10px" }}>
                        Link do produktu:{" "}
                        {nazwa.toLowerCase().replaceAll(" ", "-")}
                    </span>
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Cena (PLN)</label>
                    <input
                        type="number"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Stan magazynowy
                    </label>
                    <input
                        type="number"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="0"
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Opis</label>
                    <textarea
                        rows={4}
                        className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Krótki opis produktu"
                    />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Zdjęcia produktu
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz produkt
                    </button>
                </div>
            </form>
        </div>
    );
}
