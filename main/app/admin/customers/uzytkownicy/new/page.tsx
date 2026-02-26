"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info, ArrowLeft } from "lucide-react";

const emptyPayload = {
    imie: "",
    nazwisko: "",
    email: "",
    haslo: "",
    nr_domu: "",
    nr_lokalu: "",
    ulica: "",
    miasto: "",
    kraj: "Polska",
    kod_pocztowy: "",
    telefon: "",
};

export default function NewUserPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [payload, setPayload] = useState(emptyPayload);

    const handleChange = (key: keyof typeof emptyPayload, value: string) => {
        setPayload((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = {
                ...payload,
                nr_lokalu: payload.nr_lokalu || undefined,
            };
            const response = await fetch("/admin/api/v1/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });
            const result = await response.json();

            if (result.status === 201) {
                alert("Użytkownik został dodany.");
                router.push("/admin/customers/uzytkownicy");
                return;
            }
            alert("Błąd: " + (result.error || "Nie udało się dodać użytkownika"));
        } catch (err) {
            console.error(err);
            alert("Błąd podczas dodawania użytkownika.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/customers/uzytkownicy"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Powrót
                </Link>
            </div>
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj użytkownika
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Wpisz dane nowego użytkownika (z palca).
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Dane osobowe
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Imię *</label>
                            <input
                                type="text"
                                value={payload.imie}
                                onChange={(e) => handleChange("imie", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="Jan"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nazwisko *</label>
                            <input
                                type="text"
                                value={payload.nazwisko}
                                onChange={(e) => handleChange("nazwisko", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="Kowalski"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email *</label>
                        <input
                            type="email"
                            value={payload.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            placeholder="jan@example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Hasło *</label>
                        <input
                            type="password"
                            value={payload.haslo}
                            onChange={(e) => handleChange("haslo", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Telefon *</label>
                        <input
                            type="tel"
                            value={payload.telefon}
                            onChange={(e) => handleChange("telefon", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            placeholder="+48 123 456 789"
                        />
                    </div>
                </div>

                <div className="rounded-lg border p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4" /> Adres
                    </h2>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Ulica *</label>
                        <input
                            type="text"
                            value={payload.ulica}
                            onChange={(e) => handleChange("ulica", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            placeholder="ul. Przykładowa"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nr domu *</label>
                            <input
                                type="text"
                                value={payload.nr_domu}
                                onChange={(e) => handleChange("nr_domu", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nr lokalu</label>
                            <input
                                type="text"
                                value={payload.nr_lokalu}
                                onChange={(e) => handleChange("nr_lokalu", e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="5"
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Kod pocztowy *</label>
                            <input
                                type="text"
                                value={payload.kod_pocztowy}
                                onChange={(e) => handleChange("kod_pocztowy", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="00-001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Miasto *</label>
                            <input
                                type="text"
                                value={payload.miasto}
                                onChange={(e) => handleChange("miasto", e.target.value)}
                                required
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                                placeholder="Warszawa"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Kraj *</label>
                        <input
                            type="text"
                            value={payload.kraj}
                            onChange={(e) => handleChange("kraj", e.target.value)}
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                            placeholder="Polska"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                    >
                        {isSubmitting ? "Zapisywanie..." : "Dodaj użytkownika"}
                    </button>
                    <Link
                        href="/admin/customers/uzytkownicy"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                        Anuluj
                    </Link>
                </div>
            </form>
        </div>
    );
}
