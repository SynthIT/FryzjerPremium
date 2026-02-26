"use client";

import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";

export default function RegisterPage() {
    const [formData, setFormData] = useState<Users>({
        email: "",
        haslo: "",
        imie: "",
        nazwisko: "",
        nr_domu: "",
        nr_lokalu: "",
        ulica: "",
        miasto: "",
        kod_pocztowy: "",
        kraj: "",
        telefon: "",
    });
    const [rePassword, setRePassword] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertInfo, setAlertInfo] = useState<string[]>([]);
    const { addUser } = useUser();
    const { notify } = useNotification();
    const router = useRouter();

    const handleChangeInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const validatePassword = useCallback(() => {
        const errors: string[] = [];
        if (formData.haslo.length < 8) {
            errors.push("Hasło powinno mieć conajmniej 8 znaków");
        }
        if (
            !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])(?!.*[()\[\]{};])[^\s]{8,}$/.test(
                formData.haslo
            )
        ) {
            errors.push("Hasło powinno zawierać: przynajmniej 1 cyfrę, literę oraz znak specjalny");
        }
        if (errors.length > 0) {
            setAlertInfo(errors);
            setShowAlert(true);
        } else {
            setAlertInfo([]);
            setShowAlert(false);
        }
    }, [formData.haslo]);

    const validateRePassword = useCallback(() => {
        if (formData.haslo !== rePassword && rePassword !== "") {
            setAlertInfo((prev) => [...prev, "Hasła nie są takie same"]);
            setShowAlert(true);
        } else {
            setAlertInfo([]);
            setShowAlert(false);
        }
    }, [formData.haslo, rePassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showAlert && formData.haslo === rePassword) {
            try {
                const response = await fetch("/api/v1/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (data.status === 201) {
                    addUser(data.user);
                    notify("Rejestracja zakończona pomyślnie", "log");
                    router.push("/");
                } else {
                    setAlertInfo([data.error || "Błąd rejestracji"]);
                    setShowAlert(true);
                    notify(data.error || "Błąd rejestracji", "error");
                }
            } catch (error) {
                setAlertInfo(["Wystąpił błąd podczas rejestracji"]);
                setShowAlert(true);
                notify("Wystąpił błąd podczas rejestracji", "error");
            }
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
                {/* Lewy panel informacyjny */}
                <div className="hidden bg-linear-to-br from-[#D2B79B] via-[#e5d0b9] to-[#f7f1ea] px-8 py-10 text-black/90 md:flex">
                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                                Salon Fryzjerski Premium
                            </p>
                            <h2 className="mt-3 text-2xl font-bold leading-snug text-black">
                                Załóż konto klienta
                            </h2>
                        </div>
                        <p className="text-sm text-black/70">
                            Rejestracja zajmie Ci dosłownie chwilę. Dzięki temu:
                        </p>
                        <ul className="space-y-2 text-sm text-black/80">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black/70" />
                                <span>łatwo umówisz wizyty i podejrzysz historię usług,</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black/70" />
                                <span>zapiszesz swoje dane do szybszych rezerwacji,</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black/70" />
                                <span>otrzymasz powiadomienia o nadchodzących wizytach.</span>
                            </li>
                        </ul>
                        <p className="mt-2 text-xs text-black/70">
                            Twoje dane są bezpieczne i wykorzystywane wyłącznie do obsługi wizyt.
                        </p>
                    </div>
                </div>

                {/* Prawy panel z formularzem */}
                <div className="flex flex-col">
                    <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                                Rejestracja
                            </h2>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Wypełnij poniższe pola, aby utworzyć konto klienta.
                            </p>
                        </div>
                        <button
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => router.push("/")}
                            aria-label="Zamknij">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <form
                        className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
                        onSubmit={handleSubmit}>
                        {showAlert && alertInfo.length > 0 && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-[0_0_0_1px_rgba(248,113,113,0.3)]">
                                {alertInfo.map((error, idx) => (
                                    <div key={idx}>{error}</div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700">
                                    Adres e-mail *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="twoj@email.pl"
                                    value={formData.email}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="telefon"
                                    className="text-sm font-medium text-gray-700">
                                    Numer telefonu *
                                </label>
                                <input
                                    id="telefon"
                                    name="telefon"
                                    type="tel"
                                    autoComplete="tel-national"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="123456789"
                                    value={formData.telefon}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="imie"
                                    className="text-sm font-medium text-gray-700">
                                    Imię *
                                </label>
                                <input
                                    id="imie"
                                    name="imie"
                                    type="text"
                                    autoComplete="given-name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="Jan"
                                    value={formData.imie}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="nazwisko"
                                    className="text-sm font-medium text-gray-700">
                                    Nazwisko *
                                </label>
                                <input
                                    id="nazwisko"
                                    name="nazwisko"
                                    type="text"
                                    autoComplete="family-name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="Kowalski"
                                    value={formData.nazwisko}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="haslo"
                                className="text-sm font-medium text-gray-700">
                                Hasło *
                            </label>
                            <input
                                id="haslo"
                                name="haslo"
                                type="password"
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                placeholder="Wpisz hasło"
                                value={formData.haslo}
                                onChange={handleChangeInput}
                                onBlur={validatePassword}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="repassword"
                                className="text-sm font-medium text-gray-700">
                                Potwierdź hasło *
                            </label>
                            <input
                                id="repassword"
                                name="repassword"
                                type="password"
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                placeholder="Potwierdź hasło"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                                onBlur={validateRePassword}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="ulica"
                                className="text-sm font-medium text-gray-700">
                                Ulica *
                            </label>
                            <input
                                id="ulica"
                                name="ulica"
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                placeholder="ul. Przykładowa"
                                value={formData.ulica}
                                onChange={handleChangeInput}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-[2fr_minmax(0,1fr)] gap-4">
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="nr_domu"
                                    className="text-sm font-medium text-gray-700">
                                    Nr domu *
                                </label>
                                <input
                                    id="nr_domu"
                                    name="nr_domu"
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="12"
                                    value={formData.nr_domu}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="nr_lokalu"
                                    className="text-sm font-medium text-gray-700">
                                    Nr lokalu
                                </label>
                                <input
                                    id="nr_lokalu"
                                    name="nr_lokalu"
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="5"
                                    value={formData.nr_lokalu}
                                    onChange={handleChangeInput}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[2fr_minmax(0,1fr)] gap-4">
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="miasto"
                                    className="text-sm font-medium text-gray-700">
                                    Miasto *
                                </label>
                                <input
                                    id="miasto"
                                    name="miasto"
                                    type="text"
                                    autoComplete="address-level2"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="Warszawa"
                                    value={formData.miasto}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="kod_pocztowy"
                                    className="text-sm font-medium text-gray-700">
                                    Kod pocztowy *
                                </label>
                                <input
                                    id="kod_pocztowy"
                                    name="kod_pocztowy"
                                    type="text"
                                    autoComplete="postal-code"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                    placeholder="00-000"
                                    pattern="[0-9]{2}-[0-9]{3}"
                                    title="Poprawny format: xx-xxx"
                                    value={formData.kod_pocztowy}
                                    onChange={handleChangeInput}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="kraj"
                                className="text-sm font-medium text-gray-700">
                                Kraj *
                            </label>
                            <input
                                id="kraj"
                                name="kraj"
                                type="text"
                                autoComplete="country-name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 focus:outline-none"
                                placeholder="Polska"
                                value={formData.kraj}
                                onChange={handleChangeInput}
                                required
                            />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-[#D2B79B] text-black font-semibold hover:bg-[#b89a7f] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                disabled={showAlert || formData.haslo !== rePassword}>
                                Zarejestruj się
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                onClick={() => router.push("/")}>
                                Anuluj
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

