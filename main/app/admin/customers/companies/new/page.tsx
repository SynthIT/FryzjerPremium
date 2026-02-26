"use client";

import { useState, useEffect } from "react";
import "@/app/globals2.css";
import { Firmy } from "@/lib/types/coursesTypes";
import { Media } from "@/lib/types/shared";
import { Users } from "@/lib/types/userTypes";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";

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
    const [users, setUsers] = useState<Users[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [employeeQuery, setEmployeeQuery] = useState("");
    const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

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

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("/admin/api/v1/users", { credentials: "include" });
                const data = await response.json();
                if (data.users) setUsers(JSON.parse(data.users));
            } finally {
                setUsersLoading(false);
            }
        }
        fetchUsers();
    }, []);
    // Auto-generuj slug z nazwy
    useEffect(() => {
        if (firmPayload.nazwa) {
            setFirmPayload((prev) => ({
                ...prev,
                slug: generateSlug(firmPayload.nazwa),
            }));
        }
    }, [firmPayload.nazwa]);

    const selectedIds = (firmPayload.instruktorzy as string[]) || [];
    const employeeFiltered = users.filter((u) => {
        if (!u._id || selectedIds.includes(u._id)) return false;
        const q = employeeQuery.trim().toLowerCase();
        if (!q) return true;
        const full = `${(u.imie || "").toLowerCase()} ${(u.nazwisko || "").toLowerCase()} ${(u.email || "").toLowerCase()}`;
        return full.includes(q);
    });

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
                        <label className="text-sm font-medium">Pracownicy (instruktorzy)</label>
                        <div className="space-y-2 relative">
                            {!usersLoading && (
                                <>
                                    <input
                                        type="text"
                                        value={employeeQuery}
                                        onChange={(e) => {
                                            setEmployeeQuery(e.target.value);
                                            setEmployeeDropdownOpen(true);
                                        }}
                                        onFocus={() => setEmployeeDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setEmployeeDropdownOpen(false), 150)}
                                        placeholder="Wpisz imię, nazwisko lub email, aby wyszukać..."
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                        autoComplete="off"
                                    />
                                    {employeeDropdownOpen && (
                                        <ul
                                            className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-background py-1 shadow-lg"
                                            role="listbox"
                                        >
                                            {employeeFiltered.length === 0 ? (
                                                <li className="px-3 py-2 text-sm text-muted-foreground">
                                                    {employeeQuery.trim() ? "Brak pasujących użytkowników" : "Wpisz frazę, aby filtrować"}
                                                </li>
                                            ) : (
                                                employeeFiltered.map((u) => (
                                                    <li
                                                        key={u._id}
                                                        role="option"
                                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent focus:bg-accent outline-none"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            const prev = firmPayload.instruktorzy as string[];
                                                            if (u._id && !prev.includes(u._id)) {
                                                                handleFirmPayloadChange("instruktorzy", [...prev, u._id]);
                                                            }
                                                            setEmployeeQuery("");
                                                            setEmployeeDropdownOpen(false);
                                                        }}
                                                    >
                                                        {u.imie} {u.nazwisko}
                                                        {u.email ? (
                                                            <span className="text-muted-foreground"> — {u.email}</span>
                                                        ) : null}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </>
                            )}
                            {usersLoading && <span className="text-sm text-muted-foreground">Ładowanie listy użytkowników...</span>}
                            <div className="flex flex-wrap gap-2">
                                {(firmPayload.instruktorzy as string[]).map((id) => {
                                    const u = users.find((x) => x._id === id);
                                    const label = u ? `${u.imie} ${u.nazwisko}` : id;
                                    return (
                                        <span
                                            key={id}
                                            className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
                                        >
                                            {label}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFirmPayloadChange(
                                                        "instruktorzy",
                                                        (firmPayload.instruktorzy as string[]).filter((x) => x !== id)
                                                    )
                                                }
                                                className="rounded p-0.5 hover:bg-muted-foreground/20"
                                                aria-label="Usuń"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
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
