"use client";

import Header from "@/components/Header";
import { Users } from "@/lib/models/Users";
import { useCallback, useEffect, useState } from "react";
export default function RegistrationPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertInfo, setAlertInfo] = useState<string[]>([]);

    const checkPassword = useCallback(() => {
        function validatePasswords() {
            if (password.length < 8) {
                setAlertInfo(["Hasło musi mieć co najmniej 8 znaków."]);
                setShowAlert(true);
                return;
            }
            password.split("").forEach((char) => {
                if (
                    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])[^\s]{9,}$/.test(
                        char
                    )
                ) {
                    setAlertInfo(["Hasło może zawierać tylko litery i cyfry."]);
                    setShowAlert(true);
                    return;
                }
            });
            if (password == "" || confirmPassword == "") {
                setShowAlert(false);
            } else {
                if (password !== confirmPassword) {
                    setShowAlert(true);
                } else {
                    setShowAlert(false);
                }
            }
        }
        validatePasswords();
        // Handle any side effects here
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        fetch("/api/v1/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                return data.status === 201
                    ? (window.location.href = "/")
                    : (setAlertInfo([data.message]), setShowAlert(true));
            });
    };

    return (
        <>
            <Header />
            <main>
                <div className="cart-page">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                Rejestracja
                            </h1>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Zarejestruj się na stronie.
                            </p>
                        </div>
                    </div>
                    {showAlert && (
                        <div className="rounded-lg border bg-red-100 p-4 text-sm text-red-700">
                            {alertInfo.map((info, index) => (
                                <p key={index}>{info}</p>
                            ))}
                        </div>
                    )}
                    <form>
                        <input
                            type={"email"}
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                        />
                        <input
                            type={"password"}
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => [
                                setPassword(e.target.value),
                                checkPassword(),
                            ]}
                            className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                        />
                        <input
                            type={"password"}
                            placeholder="Potwierdź hasło"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                        />
                        <button
                            type="submit"
                            className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto"
                            onClick={handleSubmit}>
                            Zarejestruj się
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}

