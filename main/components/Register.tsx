"use client";

import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useNotification } from "@/contexts/NotificationContext";

export default function RegisterPage() {
    const [mounted, setMounted] = useState(false);
    const [formData, setFromData] = useState<Users>({
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

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChangeInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFromData((prev) => ({ ...prev, [name]: value }));
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
        <>
            {mounted &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                router.push("/");
                            }
                        }}>
                        <div
                            className="relative w-full rounded-2xl bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Rejestracja
                                </h2>
                                <button
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                                    onClick={() => router.push("/")}
                                    aria-label="Zamknij">
                                    <svg
                                        viewBox="0 0 24 24"
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
                                className="flex flex-col p-6"
                                onSubmit={handleSubmit}
                                style={{ gap: "16px", overflowY: "visible" }}>
                                {showAlert && alertInfo.length > 0 && (
                                    <div
                                        style={{
                                            padding: "12px",
                                            background: "rgba(239, 68, 68, 0.1)",
                                            border: "1px solid rgba(239, 68, 68, 0.3)",
                                            borderRadius: "12px",
                                            color: "#dc2626",
                                            fontSize: "14px",
                                        }}>
                                        {alertInfo.map((error, idx) => (
                                            <div key={idx}>{error}</div>
                                        ))}
                                    </div>
                                )}

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                        gap: "16px",
                                    }}>
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

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                        gap: "16px",
                                    }}>
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
                                        onChange={(e) =>
                                            setRePassword(e.target.value)
                                        }
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

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr",
                                        gap: "16px",
                                    }}>
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

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr",
                                        gap: "16px",
                                    }}>
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

                                <div className="flex flex-wrap gap-3 pt-4">
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
                    </div>,
                    document.body
                )}
        </>
    );
}
