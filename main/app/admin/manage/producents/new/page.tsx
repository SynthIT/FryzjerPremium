"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { generateSlug } from "@/lib/utils_admin";
import { useRouter } from "next/navigation";
import { Producents } from "@/lib/types/productTypes";

export default function NewProductPage() {
    const router = useRouter();
    const [producentData, setProducentData] = useState<Producents>({
        nazwa: "",
        slug: "",
        logo: {
            nazwa: "",
            slug: "",
            typ: "image",
            alt: "",
            path: "",
        },
        strona_internetowa: null,
        opis: "",
    });

    const sendNewProducent = async () => {
        const response = await fetch("/admin/api/v1/producents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(producentData),
        });
        const result = await response.json();
        if (result.status === 201) {
            alert("Producent został dodany pomyślnie!");
            router.push("/admin/manage/producents");
        } else {
            alert("Błąd podczas dodawania producenta: " + result.error);
        }
    };
    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj producenta
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij informacje o produencie.
                </p>
            </div>

            <form className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa producenta</label>
                    <input
                        value={producentData.nazwa}
                        onChange={(v) => {
                            setProducentData({ ...producentData, nazwa: v.target.value, slug: generateSlug(v.target.value) });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. L'Oréal"
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Opis producenta
                    </label>
                    <textarea
                        rows={4}
                        value={producentData.opis}
                        onChange={(v) => {
                            setProducentData({ ...producentData, opis: v.target.value });
                        }}
                        className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Opis producenta..."
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                        Strona internetowa
                    </label>
                    <input
                        type="url"
                        value={producentData.strona_internetowa || ""}
                        onChange={(v) => {
                            setProducentData({ ...producentData, strona_internetowa: v.target.value });
                        }}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="https://example.com"
                    />

                </div>

                <div className="sm:col-span-2">
                    <button
                        onClick={sendNewProducent}
                        type="submit"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz producenta
                    </button>
                </div>
            </form>
        </div>
    );
}
