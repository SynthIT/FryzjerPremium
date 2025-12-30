import { useUser } from "@/contexts/UserContext";
import { Users } from "@/lib/types/userTypes";
import { useState, useCallback, ChangeEvent } from "react";

export default function RegisterPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [imie, setImie] = useState<string>("");
    const [nazwisko, setNazwisko] = useState<string>("");
    const [nrDomu, setnrDomu] = useState<string>("");
    const [nrMieszkania, setnrMieszkania] = useState<string | undefined>();
    const [ulica, setUlica] = useState<string>("");
    const [miasto, setMiasto] = useState<string>("");
    const [kodPocztowy, setKodPocztowy] = useState<string>("");
    const [kraj, setKraj] = useState<string>("");
    const [numerTel, setNumerTel] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertInfo, setAlertInfo] = useState<string[]>([]);
    const { addUser } = useUser();

    const validatePost = (e: ChangeEvent<HTMLInputElement>) => {
        e.target.checkValidity();
        if (e.target.value.length > 6) return;
        if ((e.nativeEvent as InputEvent).inputType == "insertText") {
            if (kodPocztowy.length > 1 && kodPocztowy.length <= 2) {
                return setKodPocztowy((prev) => {
                    return prev + "-" + (e.nativeEvent as InputEvent).data;
                });
            }
            setKodPocztowy((prev) => {
                return prev + (e.nativeEvent as InputEvent).data;
            });
        } else {
            setKodPocztowy(e.target.value);
        }
    };
    const validatePhone = (e: ChangeEvent<HTMLInputElement>) => {
        e.target.checkValidity();
        if (e.target.value.length > 9) return;

        setNumerTel(e.target.value);
    };

    const checkPassword = useCallback(() => {
        function validatePasswords() {
            if (password.length < 8) {
                setAlertInfo(["Hasło musi mieć co najmniej 8 znaków."]);
                setShowAlert(true);
                return true;
            }
            password.split("").forEach((char) => {
                if (
                    !/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])[^\s]{9,}$/.test(
                        char
                    )
                ) {
                    setAlertInfo(["Hasło może zawierać tylko litery i cyfry."]);
                    setShowAlert(true);
                    return true;
                }
            });
            if (password == "" || confirmPassword == "") {
                setShowAlert(false);
                return false;
            } else {
                if (password !== confirmPassword) {
                    setShowAlert(true);
                    return true;
                } else {
                    setShowAlert(false);
                    return false;
                }
            }
        }
        return validatePasswords();
        // Handle any side effects here
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!checkPassword()) {
            const User: Users = {
                imie: imie,
                nazwisko: nazwisko,
                email: email,
                haslo: password,
                nr_domu: nrDomu,
                nr_lokalu: nrMieszkania,
                ulica: ulica,
                miasto: miasto,
                kraj: kraj,
                kod_pocztowy: kodPocztowy,
                telefon: numerTel,
                osoba_prywatna: false,
                zamowienia: [],
                nip: undefined,
                faktura: undefined,
            };
            fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(User),
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
                    {showAlert && (
                        <div className="rounded-lg border bg-red-100 p-4 text-sm text-red-700">
                            {alertInfo.map((info, index) => (
                                <p key={index}>{info}</p>
                            ))}
                        </div>
                    )}
                    <form className="w-auto m-5">
                        <div className="flex flex-wrap sm:justify-center">
                            <div className="p-2 m-2 max-w-[50%] min-w-xs flex justify-center flex-col gap-1">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <label htmlFor="password">Podaj hasło:</label>
                                <input
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    type={"password"}
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => [
                                        setPassword(e.target.value),
                                        checkPassword(),
                                    ]}
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
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                            </div>
                            <div className="p-2 m-2 max-w-[50%] min-w-xs flex flex-col gap-1">
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
                                    value={imie}
                                    onChange={(e) => setImie(e.target.value)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <label htmlFor="nazwisko">Nazwisko:</label>
                                <input
                                    id="nazwisko"
                                    name="nazwisko"
                                    type={"text"}
                                    autoComplete="family-name"
                                    placeholder="Nazwisko"
                                    value={nazwisko}
                                    onChange={(e) =>
                                        setNazwisko(e.target.value)
                                    }
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <div className="flex gap-1">
                                    <div className="flex flex-col">
                                        <label htmlFor="nrdomu">Nr domu:</label>
                                        <input
                                            id="nrdomu"
                                            name="nrdomu"
                                            type={"text"}
                                            placeholder="Nr domu"
                                            value={nrDomu}
                                            onChange={(e) =>
                                                setnrDomu(e.target.value)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="nrmieszkania">
                                            Nr mieszkania
                                        </label>
                                        <input
                                            name="nrmieszkania"
                                            id="nrmieszkania"
                                            type={"text"}
                                            placeholder="Nr mieszkania"
                                            value={nrMieszkania}
                                            onChange={(e) =>
                                                setnrMieszkania(e.target.value)
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
                                    value={ulica}
                                    onChange={(e) => setUlica(e.target.value)}
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
                                            value={miasto}
                                            onChange={(e) =>
                                                setMiasto(e.target.value)
                                            }
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor="miasto">
                                            Kod pocztowy
                                        </label>
                                        <input
                                            id="kodpoc"
                                            name="kodpoc"
                                            type={"text"}
                                            autoComplete="postal-code"
                                            placeholder="Kod pocztowy"
                                            value={kodPocztowy}
                                            pattern="/[0-9]{2}-[0-9]{3}$"
                                            title="Poprawny format adresu to xx-xxx"
                                            onChange={validatePost}
                                            className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent mb-2"
                                        />
                                    </div>
                                </div>
                                <label htmlFor="kraj">Kraj</label>
                                <input
                                    id="kraj"
                                    name="kraj"
                                    type="text"
                                    value={kraj}
                                    placeholder="Kraj"
                                    autoComplete="country-name"
                                    onChange={(e) => setKraj(e.target.value)}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"></input>
                                <label htmlFor="numertel">Numer telefonu</label>
                                <input
                                    type="text"
                                    name="numertel"
                                    id="numertel"
                                    value={numerTel}
                                    autoComplete="tel-national"
                                    placeholder="Numer telefonu"
                                    pattern="\[0-9]{9}\"
                                    onChange={validatePhone}
                                    className="w-full text-zinc-900 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto mb-2"
                                />
                                <br></br>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
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

