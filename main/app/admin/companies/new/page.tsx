"use client";

import { useState, useEffect } from "react";
import "@/app/globals2.css";
import { Firmy, Media } from "@/lib/types/coursesTypes.";
import { useRouter } from "next/navigation";

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
    
    // Podstawowe dane firmy
    const [nazwa, setNazwa] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [opis, setOpis] = useState<string>("");
    const [strona_internetowa, setStrona_internetowa] = useState<string>("");
    const [logoPath, setLogoPath] = useState<string>("");
    const [logoAlt, setLogoAlt] = useState<string>("");

    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (nazwa) {
            setSlug(generateSlug(nazwa));
        }
    }, [nazwa]);

    // Wysyłanie firmy
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Przygotuj logo
            const logo: Media = {
                nazwa: logoAlt || nazwa,
                slug: generateSlug(logoAlt || nazwa),
                typ: "image",
                alt: logoAlt || nazwa,
                path: logoPath,
            };

            // Przygotuj firmę zgodną ze schematem
            const companyData: Firmy = {
                nazwa,
                slug,
                logo,
                opis: opis || undefined,
                strona_internetowa: strona_internetowa || null,
            };

            const response = await fetch("/admin/api/v1/firmy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(companyData),
            });

            const result = await response.json();
            
            if (result.status === 201 || response.ok) {
                alert("Firma została dodana pomyślnie!");
                router.push("/admin/companies");
            } else {
                alert("Błąd podczas dodawania firmy: " + (result.error || "Nieznany błąd"));
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
                    Uzupełnij podstawowe informacje o firmie prowadzącej szkolenia.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2">
                {/* Nazwa i Slug */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa firmy *</label>
                    <input
                        type="text"
                        value={nazwa}
                        onChange={(e) => setNazwa(e.target.value)}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Akademia Fryzjerstwa"
                    />
                    <span className="text-xs text-muted-foreground">
                        Slug (auto-generowany): {slug || "(wpisz nazwę)"}
                    </span>
                </div>

                {/* Opis */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Opis</label>
                    <textarea
                        rows={4}
                        value={opis}
                        onChange={(e) => setOpis(e.target.value)}
                        className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Opis firmy..."
                    />
                </div>

                {/* Strona internetowa */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Strona internetowa</label>
                    <input
                        type="url"
                        value={strona_internetowa}
                        onChange={(e) => setStrona_internetowa(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="https://example.com"
                    />
                </div>

                {/* Logo */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Logo</label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={logoPath}
                            onChange={(e) => setLogoPath(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Ścieżka do logo (np. /images/logo.png)"
                        />
                        <input
                            type="text"
                            value={logoAlt}
                            onChange={(e) => setLogoAlt(e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="Alt text dla logo"
                        />
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
