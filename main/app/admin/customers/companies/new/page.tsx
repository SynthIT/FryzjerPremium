"use client";

import { useState, useEffect } from "react";
import "@/app/globals2.css";
import { Firmy } from "@/lib/types/coursesTypes";
import { Media } from "@/lib/types/shared";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

// Helper do generowania slug
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function NewCompanyPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [firmPayload, setFirmPayload] = useState<Firmy>({
        nazwa: "",
        slug: "",
        logo: {
            nazwa: "",
            slug: "",
            typ: "image",
            alt: "",
            path: "",
        },
        opis: "",
        prowizja: 0,
        prowizja_typ: "procent",
        prowizja_vat: "brutto",
        strona_internetowa: null,
        instruktorzy: [],
        _id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFirmPayloadChange = (key: keyof Firmy, value: any) => {
        setFirmPayload((prev) => ({ ...prev, [key]: value }));
    };
    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (firmPayload.nazwa) {
            setFirmPayload((prev) => ({
                ...prev,
                slug: generateSlug(firmPayload.nazwa),
            }));
        }
    }, [firmPayload.nazwa]);

    // Wysyłanie firmy
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj logo
            const logo: Media = {
                nazwa: firmPayload.logo.alt || firmPayload.nazwa,
                slug: generateSlug(firmPayload.logo.alt || firmPayload.nazwa),
                typ: "image",
                alt: firmPayload.logo.alt || firmPayload.nazwa,
                path: firmPayload.logo.path,
            };

            const response = await fetch("/admin/api/v1/firmy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(firmPayload),
            });

            const result = await response.json();

            if (result.status === 201 || response.ok) {
                alert("Firma została dodana pomyślnie!");
                router.push("/admin/customers/companies");
            } else {
                alert(
                    "Błąd podczas dodawania firmy: " +
                    (result.error || "Nieznany błąd"),
                );
            }
        } catch (error) {
            console.error("Błąd podczas dodawania firmy:", error);
            alert("Błąd podczas dodawania firmy. Sprawdź konsolę.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj firmę
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o firmie prowadzącej
                    szkolenia.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8">
                {/* Sekcja 1: Podstawowe informacje*/}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Podstawowe informacje
                    </h2>
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Nazwa firmy *</label>
                        <input
                            type="text"
                            value={firmPayload.nazwa}
                            onChange={(e) => handleFirmPayloadChange("nazwa", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Np. Akademia Fryzjerstwa"
                        />
                        <span className="text-xs text-muted-foreground">
                            Slug (auto-generowany): {firmPayload.slug || "(wpisz nazwę)"}
                        </span>
                    </div>

                    {/* Opis */}
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Opis</label>
                        <textarea
                            rows={4}
                            value={firmPayload.opis}
                            onChange={(e) => handleFirmPayloadChange("opis", e.target.value)}
                            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Opis firmy..."
                        />
                    </div>

                    {/* Strona internetowa */}
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">
                            Strona internetowa
                        </label>
                        <input
                            type="url"
                            value={firmPayload.strona_internetowa || ""}
                            onChange={(e) => handleFirmPayloadChange("strona_internetowa", e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="https://example.com"
                        />
                    </div>
                </div>
                {/* Sekcja 2: Pracownicy i prowizja */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Pracownicy i prowizja
                    </h2>
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Pracownicy</label>
                        <div className="space-y-2">
                            <input type="text" value={firmPayload.instruktorzy.join(", ") || ""} onChange={(e) => handleFirmPayloadChange("instruktorzy", e.target.value.split(", ").map((instruktor) => instruktor.trim()))} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring" placeholder="Pracownicy (np. Jan Kowalski, Anna Nowak)" />
                            <label className="text-sm font-medium">Prowizja</label>
                            <input type="number" value={firmPayload.prowizja} onChange={(e) => handleFirmPayloadChange("prowizja", parseFloat(e.target.value))} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring" placeholder="Prowizja (np. 10)" />
                            <label className="text-sm font-medium">Typ prowizji</label>
                            <select value={firmPayload.prowizja_typ} onChange={(e) => handleFirmPayloadChange("prowizja_typ", e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring">
                                <option value="procent">Procent</option>
                                <option value="kwota">Kwota</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Sekcja 3: Logo */}
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Logo
                    </h2>
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Logo</label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={firmPayload.logo.path || ""}
                                onChange={(e) => handleFirmPayloadChange("logo", { ...firmPayload.logo, path: e.target.value })}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Ścieżka do logo (np. /images/logo.png)"
                            />
                            <input
                                type="text"
                                value={firmPayload.logo.alt || ""}
                                onChange={(e) => handleFirmPayloadChange("logo", { ...firmPayload.logo, alt: e.target.value })}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Alt text dla logo"
                            />
                        </div>
                    </div>
                </div>



                {/* Submit */}
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50">
                        {isSubmitting ? "Zapisywanie..." : "Zapisz firmę"}
                    </button>
                </div>
            </form>
        </div>
    );
}
