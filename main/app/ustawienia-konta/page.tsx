"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Info, LockKeyhole, MapPin, Settings, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";

export default function AccountSettingsPage() {
    const [activeSection, setActiveSection] = useState("personal");
    const { userData,  changePassword, changeUserData } = useUser();
    const [user, setUserData] = useState<Partial<Users>>({
        imie: "",
        nazwisko: "",
        email: "",
        nr_domu: "",
        nr_lokalu: "",
        ulica: "",
        miasto: "",
        kraj: "",
        kod_pocztowy: "",
        telefon: "",
    });

    const [oldPass, setOldPass] = useState<string>("");
    const [newPass, setNewPass] = useState<string>("");
    const [reNewPass, setReNewPass] = useState<string>("");
    const [passNot, setPassNot] = useState<boolean>(true);

    useEffect(() => {
        function s() {
            if (!userData) {
                setUserData(userData!);
            } else {
                setUserData(userData);
            }
            return true;
        }
        s();
    }, [userData]);

    const sections = [
        { id: "personal", label: "Dane osobowe", icon: <User /> },
        { id: "address", label: "Adres dostawy", icon: <MapPin /> },
        { id: "password", label: "Zmiana hasła", icon: <LockKeyhole /> },
        { id: "preferences", label: "Preferencje", icon: <Settings /> },
        { id: "actions", label: "Akcje konta", icon: <Info /> },
    ];

    const handleChangePartial = async (dane: Partial<Users>) => {
        const ok = await changeUserData(dane);
        alert(ok);
    };

    const handlePasswordChange = async (old: string, n: string) => {
        const ok = await changePassword(n, old);
        alert(ok);
    };

    useEffect(() => {
        function b() {
            setPassNot(!passNot);
        }
        if (newPass !== reNewPass && reNewPass !== "" && passNot) {
            b();
        }
        if (
            newPass === reNewPass &&
            newPass !== "" &&
            reNewPass !== "" &&
            passNot
        ) {
            b();
        }
    }, [newPass, reNewPass, passNot]);

    return (
        <>
            <Header />
            <main className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64 shrink-0 rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-4 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Ustawienia</h2>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                                        activeSection === section.id
                                            ? "bg-[#D2B79B]/20 text-[#D2B79B]"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() =>
                                        setActiveSection(section.id)
                                    }>
                                    <span aria-hidden="true">{section.icon}</span>
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-8">
                            {/* Personal Information Section */}
                            {activeSection === "personal" && (
                                <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Dane osobowe
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Zaktualizuj swoje dane osobowe i
                                        informacje kontaktowe.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="firstName"
                                                    className="text-sm font-medium text-gray-700">
                                                    Imię
                                                </label>
                                                <input
                                                    value={user.imie || ""}
                                                    onChange={(e) => {
                                                        setUserData({
                                                            ...user,
                                                            imie: e.target
                                                                .value,
                                                        });
                                                    }}
                                                    type="text"
                                                    id="firstName"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="Wprowadź imię"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="lastName"
                                                    className="text-sm font-medium text-gray-700">
                                                    Nazwisko
                                                </label>
                                                <input
                                                    value={user.nazwisko || ""}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...user,
                                                            nazwisko:
                                                                e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    id="lastName"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="Wprowadź nazwisko"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium text-gray-700">
                                                Adres e-mail
                                            </label>
                                            <input
                                                disabled={true}
                                                value={user.email || ""}
                                                onChange={(e) =>
                                                    setUserData({
                                                        ...userData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                type="email"
                                                id="email"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="twoj@email.pl"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="phone"
                                                className="text-sm font-medium text-gray-700">
                                                Numer telefonu
                                            </label>
                                            <input
                                                value={user.telefon || ""}
                                                onChange={(e) =>
                                                    setUserData({
                                                        ...userData,
                                                        telefon: e.target.value,
                                                    })
                                                }
                                                type="tel"
                                                id="phone"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="+48 123 456 789"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleChangePartial({
                                                    imie: user.imie,
                                                    nazwisko: user.nazwisko,
                                                    telefon: user.telefon,
                                                })
                                            }
                                            className="px-6 py-2.5 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors">
                                            <span>Zapisz zmiany</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Address Section */}
                            {activeSection === "address" && (
                                <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Adres dostawy
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Zarządzaj adresami dostawy dla swoich
                                        zamówień.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="street"
                                                className="text-sm font-medium text-gray-700">
                                                Ulica
                                            </label>
                                            <input
                                                type="text"
                                                id="street"
                                                value={user.ulica || ""}
                                                onChange={(e) =>
                                                    setUserData({
                                                        ...user,
                                                        ulica: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="ul. Przykładowa 123"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="postalCode"
                                                    className="text-sm font-medium text-gray-700">
                                                    Numer domu
                                                </label>
                                                <input
                                                    value={user.nr_domu || ""}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...user,
                                                            nr_domu:
                                                                e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    id="house_number"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="city"
                                                    className="text-sm font-medium text-gray-700">
                                                    Numer mieszkania
                                                </label>
                                                <input
                                                    value={user.nr_lokalu || ""}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...user,
                                                            nr_lokalu:
                                                                e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    id="flat_number"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="2"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="postalCode"
                                                    className="text-sm font-medium text-gray-700">
                                                    Kod pocztowy
                                                </label>
                                                <input
                                                    value={
                                                        user.kod_pocztowy || ""
                                                    }
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...user,
                                                            kod_pocztowy:
                                                                e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    id="postalCode"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="00-000"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label
                                                    htmlFor="city"
                                                    className="text-sm font-medium text-gray-700">
                                                    Miasto
                                                </label>
                                                <input
                                                    value={user.miasto || ""}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...user,
                                                            miasto: e.target
                                                                .value,
                                                        })
                                                    }
                                                    type="text"
                                                    id="city"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                    placeholder="Warszawa"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="country"
                                                className="text-sm font-medium text-gray-700">
                                                Kraj
                                            </label>
                                            <select
                                                id="country"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500">
                                                <option value="pl">
                                                    Polska
                                                </option>
                                                <option value="de">
                                                    Niemcy
                                                </option>
                                                <option value="cz">
                                                    Czechy
                                                </option>
                                                <option value="sk">
                                                    Słowacja
                                                </option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleChangePartial({
                                                    ulica: user.ulica || "",
                                                    nr_domu: user.nr_domu || "",
                                                    nr_lokalu:
                                                        user.nr_lokalu || "",
                                                    kod_pocztowy:
                                                        user.kod_pocztowy || "",
                                                    miasto: user.miasto || "",
                                                })
                                            }
                                            className="px-6 py-2.5 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors">
                                            <span>Zapisz adres</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Password Section */}
                            {activeSection === "password" && (
                                <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Zmiana hasła
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Zmień swoje hasło, aby zwiększyć
                                        bezpieczeństwo konta.
                                    </p>
                                    <div className="space-y-4">
                                        {!passNot ? (
                                            <div>
                                                <p>Hasła nie są takie same</p>
                                            </div>
                                        ) : null}
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="currentPassword"
                                                className="text-sm font-medium text-gray-700">
                                                Aktualne hasło
                                            </label>
                                            <input
                                                value={oldPass}
                                                onChange={(e) =>
                                                    setOldPass(e.target.value)
                                                }
                                                type="password"
                                                id="currentPassword"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="Wprowadź aktualne hasło"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="newPassword"
                                                className="text-sm font-medium text-gray-700">
                                                Nowe hasło
                                            </label>
                                            <input
                                                value={newPass}
                                                onChange={(e) =>
                                                    setNewPass(e.target.value)
                                                }
                                                type="password"
                                                id="newPassword"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="Wprowadź nowe hasło (min. 8 znaków)"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="text-sm font-medium text-gray-700">
                                                Potwierdź nowe hasło
                                            </label>
                                            <input
                                                value={reNewPass}
                                                onChange={(e) =>
                                                    setReNewPass(e.target.value)
                                                }
                                                type="password"
                                                id="confirmPassword"
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#D2B79B] focus:ring-2 focus:ring-[#D2B79B]/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                                placeholder="Potwierdź nowe hasło"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                handlePasswordChange(
                                                    oldPass,
                                                    newPass,
                                                )
                                            }
                                            className="px-6 py-2.5 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors">
                                            <span>Zmień hasło</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Newsletter Section */}
                            {activeSection === "preferences" && (
                                <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Preferencje komunikacji
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Wybierz, jakie informacje chcesz
                                        otrzymywać od nas.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                                                    defaultChecked
                                                />
                                                <span className="flex flex-col gap-0.5">
                                                    <strong>
                                                        Newsletter z ofertami
                                                    </strong>
                                                    <span className="text-sm text-gray-500 font-normal">
                                                        Otrzymuj najlepsze
                                                        oferty i promocje
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                                                    defaultChecked
                                                />
                                                <span className="flex flex-col gap-0.5">
                                                    <strong>
                                                        Powiadomienia o
                                                        zamówieniach
                                                    </strong>
                                                    <span className="text-sm text-gray-500 font-normal">
                                                        Informacje o statusie
                                                        Twojego zamówienia
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 rounded border-gray-300 text-[#D2B79B] focus:ring-[#D2B79B]"
                                                />
                                                <span className="flex flex-col gap-0.5">
                                                    <strong>
                                                        Porady i nowości
                                                    </strong>
                                                    <span className="text-sm text-gray-500 font-normal">
                                                        E-maile z poradami i
                                                        trendami z branży
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <button className="px-6 py-2.5 rounded-xl font-semibold bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors">
                                            <span>Zapisz preferencje</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Account Actions Section */}
                            {activeSection === "actions" && (
                                <section className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        Akcje konta
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Zarządzaj danymi konta i wykonaj
                                        zaawansowane akcje.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    Eksportuj dane
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Pobierz kopię wszystkich
                                                    swoich danych osobowych w
                                                    formacie JSON.
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                                                Eksportuj dane
                                            </button>
                                        </div>
                                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    Usuń konto
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Trwale usuń swoje konto i
                                                    wszystkie powiązane dane. Ta
                                                    akcja jest nieodwracalna.
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors">
                                                Usuń konto
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
