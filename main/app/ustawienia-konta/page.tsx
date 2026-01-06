"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Info, LockKeyhole, MapPin, Settings, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";

export default function AccountSettingsPage() {
    const [activeSection, setActiveSection] = useState("personal");
    const { user, changePassword, changeUserData } = useUser();
    const [email, setEmail] = useState<string>("");
    const [imie, setImie] = useState<string>("");
    const [nazwisko, setNazwisko] = useState<string>("");
    const [nrDomu, setnrDomu] = useState<string>("");
    const [nrMieszkania, setnrMieszkania] = useState<string | undefined>();
    const [ulica, setUlica] = useState<string>("");
    const [miasto, setMiasto] = useState<string>("");
    const [kodPocztowy, setKodPocztowy] = useState<string>("");
    const [kraj, setKraj] = useState<string>("");
    const [numerTel, setNumerTel] = useState<string>("");

    const [oldPass, setOldPass] = useState<string>("");
    const [newPass, setNewPass] = useState<string>("");
    const [reNewPass, setReNewPass] = useState<string>("");
    const [passNot, setPassNot] = useState<boolean>(true);

    useEffect(() => {
        function s() {
            if (!user) return false;
            setEmail(user.email);
            setImie(user.imie);
            setNazwisko(user.nazwisko);
            setnrDomu(user.nr_domu);
            setnrMieszkania(user.nr_lokalu);
            setUlica(user.ulica);
            setMiasto(user.miasto);
            setKodPocztowy(user.kod_pocztowy);
            setKraj(user.kraj);
            setNumerTel(user.telefon);
        }
        s();
    }, [user]);

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
        if (newPass === reNewPass && newPass !== "" && reNewPass !== "" && passNot) {
            b();
        }
    }, [newPass, reNewPass, passNot]);

    return (
        <>
            <Header />
            <main className="settings-page-container">
                <div className="settings-layout">
                    {/* Sidebar */}
                    <aside className="settings-sidebar">
                        <h2 className="settings-sidebar-title">Ustawienia</h2>
                        <nav className="settings-sidebar-nav">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    className={`settings-sidebar-item ${
                                        activeSection === section.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setActiveSection(section.id)
                                    }>
                                    <span
                                        className="settings-sidebar-icon"
                                        aria-hidden="true">
                                        {section.icon}
                                    </span>
                                    <span className="settings-sidebar-label">
                                        {section.label}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="settings-main-content">
                        <div className="settings-content-wrapper">
                            {/* Personal Information Section */}
                            {activeSection === "personal" && (
                                <section className="settings-section">
                                    <h2 className="settings-section-title">
                                        Dane osobowe
                                    </h2>
                                    <p className="settings-section-description">
                                        Zaktualizuj swoje dane osobowe i
                                        informacje kontaktowe.
                                    </p>
                                    <div className="settings-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label
                                                    htmlFor="firstName"
                                                    className="form-label">
                                                    Imię
                                                </label>
                                                <input
                                                    value={imie}
                                                    onChange={(e) => {
                                                        setImie(e.target.value);
                                                    }}
                                                    type="text"
                                                    id="firstName"
                                                    className="form-input"
                                                    placeholder="Wprowadź imię"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label
                                                    htmlFor="lastName"
                                                    className="form-label">
                                                    Nazwisko
                                                </label>
                                                <input
                                                    value={nazwisko}
                                                    onChange={(e) =>
                                                        setNazwisko(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    id="lastName"
                                                    className="form-input"
                                                    placeholder="Wprowadź nazwisko"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="email"
                                                className="form-label">
                                                Adres e-mail
                                            </label>
                                            <input
                                                disabled={true}
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                type="email"
                                                id="email"
                                                className="form-input"
                                                placeholder="twoj@email.pl"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="phone"
                                                className="form-label">
                                                Numer telefonu
                                            </label>
                                            <input
                                                value={numerTel}
                                                onChange={(e) =>
                                                    setNumerTel(e.target.value)
                                                }
                                                type="tel"
                                                id="phone"
                                                className="form-input"
                                                placeholder="+48 123 456 789"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleChangePartial({
                                                    imie: imie,
                                                    nazwisko: nazwisko,
                                                    telefon: numerTel,
                                                })
                                            }
                                            className="settings-save-button">
                                            <span>Zapisz zmiany</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Address Section */}
                            {activeSection === "address" && (
                                <section className="settings-section">
                                    <h2 className="settings-section-title">
                                        Adres dostawy
                                    </h2>
                                    <p className="settings-section-description">
                                        Zarządzaj adresami dostawy dla swoich
                                        zamówień.
                                    </p>
                                    <div className="settings-form">
                                        <div className="form-group">
                                            <label
                                                htmlFor="street"
                                                className="form-label">
                                                Ulica
                                            </label>
                                            <input
                                                type="text"
                                                id="street"
                                                value={ulica}
                                                onChange={(e) =>
                                                    setUlica(e.target.value)
                                                }
                                                className="form-input"
                                                placeholder="ul. Przykładowa 123"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label
                                                    htmlFor="postalCode"
                                                    className="form-label">
                                                    Numer domu
                                                </label>
                                                <input
                                                    value={nrDomu}
                                                    onChange={(e) =>
                                                        setnrDomu(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    id="house_number"
                                                    className="form-input"
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label
                                                    htmlFor="city"
                                                    className="form-label">
                                                    Numer mieszkania
                                                </label>
                                                <input
                                                    value={nrMieszkania}
                                                    onChange={(e) =>
                                                        setnrMieszkania(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    id="flat_number"
                                                    className="form-input"
                                                    placeholder="2"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label
                                                    htmlFor="postalCode"
                                                    className="form-label">
                                                    Kod pocztowy
                                                </label>
                                                <input
                                                    value={kodPocztowy}
                                                    onChange={(e) =>
                                                        setKodPocztowy(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    id="postalCode"
                                                    className="form-input"
                                                    placeholder="00-000"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label
                                                    htmlFor="city"
                                                    className="form-label">
                                                    Miasto
                                                </label>
                                                <input
                                                    value={miasto}
                                                    onChange={(e) =>
                                                        setMiasto(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="text"
                                                    id="city"
                                                    className="form-input"
                                                    placeholder="Warszawa"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="country"
                                                className="form-label">
                                                Kraj
                                            </label>
                                            <select
                                                id="country"
                                                className="form-input">
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
                                                    ulica: ulica,
                                                    nr_domu: nrDomu,
                                                    nr_lokalu: nrMieszkania,
                                                    kod_pocztowy: kodPocztowy,
                                                    miasto: miasto,
                                                })
                                            }
                                            className="settings-save-button">
                                            <span>Zapisz adres</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Password Section */}
                            {activeSection === "password" && (
                                <section className="settings-section">
                                    <h2 className="settings-section-title">
                                        Zmiana hasła
                                    </h2>
                                    <p className="settings-section-description">
                                        Zmień swoje hasło, aby zwiększyć
                                        bezpieczeństwo konta.
                                    </p>
                                    <div className="settings-form">
                                        {!passNot ? (
                                            <div>
                                                <p>Hasła nie są takie same</p>
                                            </div>
                                        ) : null}
                                        <div className="form-group">
                                            <label
                                                htmlFor="currentPassword"
                                                className="form-label">
                                                Aktualne hasło
                                            </label>
                                            <input
                                                value={oldPass}
                                                onChange={(e) =>
                                                    setOldPass(e.target.value)
                                                }
                                                type="password"
                                                id="currentPassword"
                                                className="form-input"
                                                placeholder="Wprowadź aktualne hasło"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="newPassword"
                                                className="form-label">
                                                Nowe hasło
                                            </label>
                                            <input
                                                value={newPass}
                                                onChange={(e) =>
                                                    setNewPass(e.target.value)
                                                }
                                                type="password"
                                                id="newPassword"
                                                className="form-input"
                                                placeholder="Wprowadź nowe hasło (min. 8 znaków)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="form-label">
                                                Potwierdź nowe hasło
                                            </label>
                                            <input
                                                value={reNewPass}
                                                onChange={(e) =>
                                                    setReNewPass(e.target.value)
                                                }
                                                type="password"
                                                id="confirmPassword"
                                                className="form-input"
                                                placeholder="Potwierdź nowe hasło"
                                            />
                                        </div>
                                        <button
                                            onClick={() =>
                                                handlePasswordChange(
                                                    oldPass,
                                                    newPass
                                                )
                                            }
                                            className="settings-save-button">
                                            <span>Zmień hasło</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Newsletter Section */}
                            {activeSection === "preferences" && (
                                <section className="settings-section">
                                    <h2 className="settings-section-title">
                                        Preferencje komunikacji
                                    </h2>
                                    <p className="settings-section-description">
                                        Wybierz, jakie informacje chcesz
                                        otrzymywać od nas.
                                    </p>
                                    <div className="settings-form">
                                        <div className="form-checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                    defaultChecked
                                                />
                                                <span className="checkbox-text">
                                                    <strong>
                                                        Newsletter z ofertami
                                                    </strong>
                                                    <span className="checkbox-description">
                                                        Otrzymuj najlepsze
                                                        oferty i promocje
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="form-checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                    defaultChecked
                                                />
                                                <span className="checkbox-text">
                                                    <strong>
                                                        Powiadomienia o
                                                        zamówieniach
                                                    </strong>
                                                    <span className="checkbox-description">
                                                        Informacje o statusie
                                                        Twojego zamówienia
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="form-checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-text">
                                                    <strong>
                                                        Porady i nowości
                                                    </strong>
                                                    <span className="checkbox-description">
                                                        E-maile z poradami i
                                                        trendami z branży
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                        <button className="settings-save-button">
                                            <span>Zapisz preferencje</span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Account Actions Section */}
                            {activeSection === "actions" && (
                                <section className="settings-section">
                                    <h2 className="settings-section-title">
                                        Akcje konta
                                    </h2>
                                    <p className="settings-section-description">
                                        Zarządzaj danymi konta i wykonaj
                                        zaawansowane akcje.
                                    </p>
                                    <div className="settings-actions">
                                        <div className="settings-action-card">
                                            <div className="settings-action-content">
                                                <h3 className="settings-action-title">
                                                    Eksportuj dane
                                                </h3>
                                                <p className="settings-action-description">
                                                    Pobierz kopię wszystkich
                                                    swoich danych osobowych w
                                                    formacie JSON.
                                                </p>
                                            </div>
                                            <button className="settings-action-button settings-action-button-secondary">
                                                Eksportuj dane
                                            </button>
                                        </div>
                                        <div className="settings-action-card settings-action-card-danger">
                                            <div className="settings-action-content">
                                                <h3 className="settings-action-title">
                                                    Usuń konto
                                                </h3>
                                                <p className="settings-action-description">
                                                    Trwale usuń swoje konto i
                                                    wszystkie powiązane dane. Ta
                                                    akcja jest nieodwracalna.
                                                </p>
                                            </div>
                                            <button className="settings-action-button settings-action-button-danger">
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
