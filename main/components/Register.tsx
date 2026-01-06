import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import React, { useState, useCallback, useEffect } from "react";

export default function RegisterPage() {
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

    const handleChangeInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFromData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const validatePassword = useCallback(() => {
        if (formData.haslo.length <= 8) {
            setAlertInfo(["Hasło powinno mieć conajmniej 8 znaków"]);
            setShowAlert(true);
        } else {
            setAlertInfo([]);
            setShowAlert(false);
        }
        if (
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])(?!.*[()\[\]{};])[^\s]{8,}$/.test(
                formData.haslo
            )
        ) {
            setAlertInfo([]);
            setShowAlert(false);
        } else {
            setAlertInfo((prev) => [
                ...prev,
                "Hasło powinno zawierać: przynajmniej 1 cyfre, litere oraz znak specjalny",
            ]);
            setShowAlert(true);
        }
    }, [formData]);

    const validateRePassword = useCallback(() => {
        if (formData.haslo !== rePassword && rePassword !== "") {
            setAlertInfo((prev) => [...prev, "Hasła nie są takie same"]);
            setShowAlert(true);
        } else {
            setAlertInfo([])
            setShowAlert(false);
        }
    }, [formData, rePassword]);

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (true) {
            fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.status === 201) {
                        addUser(data.user);
                        return (window.location.href = "/");
                    }
                    return setAlertInfo([data.message]), setShowAlert(true);
                });
        }
    };

    return (
        <main className="mt-50 flex justify-center">
            <div className="max-w-9xl min-w-lg h-auto border-3 rounded-md bg-sky-50 gap-4">
                <div className="flex flex-col flex-wrap lg:flex-row items-center justify-evenly">
                    <div className="p-4 w-xl h-full">
                        <div>
                            <h1 className="text-5xl text-zinc-900 font-semibold tracking-tight p-5">
                                Rejestracja
                            </h1>
                            <span className="font-sm text-muted-foreground sm:text-lg p-5">
                                Po zarejestrowaniu się na naszym portalu
                                będziesz mógł/a:
                                <ol className="list-disc pl-5">
                                    <li>zamieszaczać komentarze na blogu</li>
                                    <li>recenzjować produkty.</li>
                                    <li>przeglądać wcześniejsze zamówienia.</li>
                                </ol>
                            </span>
                        </div>
                    </div>
                    <form className="w-auto m-5">
                        <div className="flex flex-wrap sm:justify-center">
                            <div className="p-2 m-2 max-w-md min-w-xs flex justify-center flex-col gap-1">
                                <p className="text-xl text-zinc-900">
                                    Podstawowe informacje
                                </p>
                                <label htmlFor="email">Adres email:</label>
                                <input
                                    id={"email"}
                                    name="email"
                                    type={"email"}
                                    autoComplete="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <label htmlFor="haslo">Podaj hasło:</label>
                                {showAlert && (
                                    <p className="text-red-900 ">
                                        {alertInfo.join("\n")}
                                    </p>
                                )}
                                <input
                                    id="haslo"
                                    name="haslo"
                                    autoComplete="new-password"
                                    type={"password"}
                                    placeholder="Hasło"
                                    value={formData.haslo}
                                    onChange={(e) => handleChangeInput(e)}
                                    onBlur={validatePassword}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <label htmlFor="repassword">
                                    Podaj ponownie hasło:
                                </label>
                                <input
                                    id="repassword"
                                    name="repassword"
                                    autoComplete="new-password"
                                    type={"password"}
                                    placeholder="Potwierdź hasło"
                                    value={rePassword}
                                    onChange={(e) =>
                                        setRePassword(e.target.value)
                                    }
                                    onBlur={validateRePassword}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                            </div>
                            <div className="p-2 m-2 max-w-md min-w-xs flex flex-col gap-1">
                                <p className="text-xl text-zinc-900">
                                    Podstawowe do wysyłki
                                </p>
                                <label htmlFor="imie">Imię:</label>
                                <input
                                    id="imie"
                                    name="imie"
                                    type={"text"}
                                    autoComplete="given-name"
                                    placeholder="Imie"
                                    value={formData.imie}
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <label htmlFor="nazwisko">Nazwisko:</label>
                                <input
                                    id="nazwisko"
                                    name="nazwisko"
                                    type={"text"}
                                    autoComplete="family-name"
                                    placeholder="Nazwisko"
                                    value={formData.nazwisko}
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <div className="flex gap-1">
                                    <div className="flex flex-col">
                                        <label htmlFor="nr_domu">
                                            Nr domu:
                                        </label>
                                        <input
                                            id="nr_domu"
                                            name="nr_domu"
                                            type={"text"}
                                            placeholder="Nr domu"
                                            value={formData.nr_domu}
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="nr_lokalu">
                                            Nr lokalu
                                        </label>
                                        <input
                                            name="nr_lokalu"
                                            id="nr_lokalu"
                                            type={"text"}
                                            placeholder="Nr mieszkania"
                                            value={formData.nr_lokalu}
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent mb-2"
                                        />
                                    </div>
                                </div>
                                <label htmlFor="ulica">Ulica </label>
                                <input
                                    id="ulica"
                                    name="ulica"
                                    type={"text"}
                                    placeholder="Ulica"
                                    value={formData.ulica}
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors sm:w-auto hover:bg-accent mb-2"
                                />
                                <div className="flex gap-1">
                                    <div className="flex flex-col max-w-lg">
                                        <label htmlFor="miasto">Miasto</label>
                                        <input
                                            autoComplete="address-level2"
                                            id="miasto"
                                            name="miasto"
                                            type={"text"}
                                            placeholder="Miasto"
                                            value={formData.miasto}
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="kod_pocztowy">
                                            Kod pocztowy
                                        </label>
                                        <input
                                            id="kod_pocztowy"
                                            name="kod_pocztowy"
                                            type={"text"}
                                            autoComplete="postal-code"
                                            placeholder="Kod pocztowy"
                                            value={formData.kod_pocztowy}
                                            pattern="/[0-9]{2}-[0-9]{3}$"
                                            title="Poprawny format adresu to xx-xxx"
                                            onChange={(e) =>
                                                handleChangeInput(e)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent mb-2"
                                        />
                                    </div>
                                </div>
                                <label htmlFor="kraj">Kraj</label>
                                <input
                                    id="kraj"
                                    name="kraj"
                                    type="text"
                                    value={formData.kraj}
                                    placeholder="Kraj"
                                    autoComplete="country-name"
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"></input>
                                <label htmlFor="telefon">Numer telefonu</label>
                                <input
                                    type="text"
                                    name="telefon"
                                    id="telefon"
                                    value={formData.telefon}
                                    autoComplete="tel-national"
                                    placeholder="Numer telefonu"
                                    pattern="\[0-9]{9}\"
                                    onChange={(e) => handleChangeInput(e)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <br></br>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                disabled={showAlert}
                                type="submit"
                                className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto"
                                onClick={handleSubmit}>
                                Zarejestruj się
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

