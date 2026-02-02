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
                        className="login-modal-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                router.push("/");
                            }
                        }}>
                        <div
                            className="login-modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
                            <div className="login-modal-header">
                                <h2 className="login-modal-title">
                                    Rejestracja
                                </h2>
                                <button
                                    className="login-modal-close"
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
                                className="login-modal-form"
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
                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="email"
                                            className="login-modal-label">
                                            Adres e-mail *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            className="login-modal-input"
                                            placeholder="twoj@email.pl"
                                            value={formData.email}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="telefon"
                                            className="login-modal-label">
                                            Numer telefonu *
                                        </label>
                                        <input
                                            id="telefon"
                                            name="telefon"
                                            type="tel"
                                            autoComplete="tel-national"
                                            className="login-modal-input"
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
                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="imie"
                                            className="login-modal-label">
                                            Imię *
                                        </label>
                                        <input
                                            id="imie"
                                            name="imie"
                                            type="text"
                                            autoComplete="given-name"
                                            className="login-modal-input"
                                            placeholder="Jan"
                                            value={formData.imie}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="nazwisko"
                                            className="login-modal-label">
                                            Nazwisko *
                                        </label>
                                        <input
                                            id="nazwisko"
                                            name="nazwisko"
                                            type="text"
                                            autoComplete="family-name"
                                            className="login-modal-input"
                                            placeholder="Kowalski"
                                            value={formData.nazwisko}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="login-modal-field">
                                    <label
                                        htmlFor="haslo"
                                        className="login-modal-label">
                                        Hasło *
                                    </label>
                                    <input
                                        id="haslo"
                                        name="haslo"
                                        type="password"
                                        autoComplete="new-password"
                                        className="login-modal-input"
                                        placeholder="Wpisz hasło"
                                        value={formData.haslo}
                                        onChange={handleChangeInput}
                                        onBlur={validatePassword}
                                        required
                                    />
                                </div>

                                <div className="login-modal-field">
                                    <label
                                        htmlFor="repassword"
                                        className="login-modal-label">
                                        Potwierdź hasło *
                                    </label>
                                    <input
                                        id="repassword"
                                        name="repassword"
                                        type="password"
                                        autoComplete="new-password"
                                        className="login-modal-input"
                                        placeholder="Potwierdź hasło"
                                        value={rePassword}
                                        onChange={(e) =>
                                            setRePassword(e.target.value)
                                        }
                                        onBlur={validateRePassword}
                                        required
                                    />
                                </div>

                                <div className="login-modal-field">
                                    <label
                                        htmlFor="ulica"
                                        className="login-modal-label">
                                        Ulica *
                                    </label>
                                    <input
                                        id="ulica"
                                        name="ulica"
                                        type="text"
                                        className="login-modal-input"
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
                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="nr_domu"
                                            className="login-modal-label">
                                            Nr domu *
                                        </label>
                                        <input
                                            id="nr_domu"
                                            name="nr_domu"
                                            type="text"
                                            className="login-modal-input"
                                            placeholder="12"
                                            value={formData.nr_domu}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="nr_lokalu"
                                            className="login-modal-label">
                                            Nr lokalu
                                        </label>
                                        <input
                                            id="nr_lokalu"
                                            name="nr_lokalu"
                                            type="text"
                                            className="login-modal-input"
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
                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="miasto"
                                            className="login-modal-label">
                                            Miasto *
                                        </label>
                                        <input
                                            id="miasto"
                                            name="miasto"
                                            type="text"
                                            autoComplete="address-level2"
                                            className="login-modal-input"
                                            placeholder="Warszawa"
                                            value={formData.miasto}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="login-modal-field">
                                        <label
                                            htmlFor="kod_pocztowy"
                                            className="login-modal-label">
                                            Kod pocztowy *
                                        </label>
                                        <input
                                            id="kod_pocztowy"
                                            name="kod_pocztowy"
                                            type="text"
                                            autoComplete="postal-code"
                                            className="login-modal-input"
                                            placeholder="00-000"
                                            pattern="[0-9]{2}-[0-9]{3}"
                                            title="Poprawny format: xx-xxx"
                                            value={formData.kod_pocztowy}
                                            onChange={handleChangeInput}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="login-modal-field">
                                    <label
                                        htmlFor="kraj"
                                        className="login-modal-label">
                                        Kraj *
                                    </label>
                                    <input
                                        id="kraj"
                                        name="kraj"
                                        type="text"
                                        autoComplete="country-name"
                                        className="login-modal-input"
                                        placeholder="Polska"
                                        value={formData.kraj}
                                        onChange={handleChangeInput}
                                        required
                                    />
                                </div>

                                <div className="login-modal-actions">
                                    <button
                                        type="submit"
                                        className="login-modal-button login-modal-button-submit"
                                        disabled={showAlert || formData.haslo !== rePassword}>
                                        Zarejestruj się
                                    </button>
                                    <button
                                        type="button"
                                        className="login-modal-button login-modal-button-cancel"
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
