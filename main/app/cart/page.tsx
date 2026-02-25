"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartPage from "@/components/CartPage";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type AuthStatus = "loading" | "logged_in" | "need_email";

const REDIRECT_MESSAGE = "wymaganym podaniu adresu @";

export default function Cart() {
    const router = useRouter();
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
    const [userExists, setUserExists] = useState(false);
    const [email, setEmail] = useState("");

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch("/api/v1/users/check", { credentials: "include" });
            const data = await res.json();
            return data.loggedIn ? "logged_in" : "need_email";
        } catch {
            return "need_email";
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        checkAuth().then((status) => {
            if (!cancelled) setAuthStatus(status);
        });
        return () => { cancelled = true; };
    }, [checkAuth]);

    const handleBackWithoutEmail = () => {
        if (!email.trim()) {
            router.replace(`/?info=${encodeURIComponent(REDIRECT_MESSAGE)}`);
            return;
        }
        router.push("/");
    };

    const handleContinueWithEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        const emailExists = await fetch("/api/v1/users/find", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
        const emailExistsData = await emailExists.json();
        if (emailExistsData.user) {
            setUserExists(true);
            return;
        }
        setAuthStatus("logged_in");
    };

    if (authStatus === "loading") {
        return (
            <>
                <Header />
                <div className="min-h-screen pt-[120px] flex items-center justify-center">
                    <p className="text-gray-600">Ładowanie...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (authStatus === "need_email") {
        return (
            <>
                <Header openLoginModal={openLoginModal} />
                <div className="min-h-screen pt-[120px] pb-16 px-4 flex items-center justify-center">
                    <div className="max-w-md w-full rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-8">
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            Podaj adres e-mail
                        </h1>
                        <p className="text-gray-600 text-sm mb-6">
                            Aby kontynuować zakupy jako gość, podaj adres email, na który ma przyjść potwierdzenie zakupu.<br></br>
                            Aby kontynuować zakupy jako zarejestrowany użytkownik, <Link href="/login" className="text-[#D2B79B] hover:text-[#b89a7f]">zaloguj się</Link>,
                            albo <Link href="/rejestracja" className="text-[#D2B79B] hover:text-[#b89a7f]">zarejestruj się</Link>.
                        </p>
                        <form onSubmit={handleContinueWithEmail} className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Adres e-mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="np. jan@example.com"
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#D2B79B] focus:ring-1 focus:ring-[#D2B79B]"
                                    required
                                    autoComplete="email"
                                />
                            </label>
                            {userExists && (<p className="mt-2 text-red-500 text-sm">Użytkownik o podanym adresie e-mail istnieje, <Link href="#" onClick={() => setOpenLoginModal((prev) => !prev)} className="text-[#D2B79B] hover:text-[#b89a7f]">zaloguj się</Link></p>)}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={!email.trim()}
                                    className="flex-1 py-3 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Kontynuuj
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackWithoutEmail}
                                    className="py-3 px-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Wstecz
                                </button>
                            </div>
                        </form>
                        <p className="mt-4 text-xs text-gray-500">
                            Kliknięcie „Wstecz” bez podania adresu e-mail przekieruje na stronę główną z informacją o wymaganym podaniu adresu e-mail.
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <CartPage />
            <Footer />
        </>
    );
}
