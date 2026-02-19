"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { Promos, SpecjalnaPromocja } from "@/lib/types/shared";
import { useRouter } from "next/navigation";

type TypPromocji = "standard" | "specjalna";

export default function NewDiscountPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [nazwa, setNazwa] = useState<string>("");
    const [typPromocji, setTypPromocji] = useState<TypPromocji>("standard");
    const [procent, setProcent] = useState<number>(0);
    const [start, setStart] = useState<Date>(() => new Date(Date.now()));
    const [end, setEnd] = useState<Date>(
        () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    );
    const [aktywna, setAktywna] = useState<boolean>(true);

    // Pola promocji specjalnej
    const [specialNazwa, setSpecialNazwa] = useState<string>("");
    const [warunek, setWarunek] = useState<number>(0);
    const [obnizaCene, setObnizaCene] = useState<boolean>(false);
    const [obnizka, setObnizka] = useState<number>(0);
    const [zmieniaCene, setZmieniaCene] = useState<boolean>(false);
    const [nowaCena, setNowaCena] = useState<number>(0);

    const sendNewPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const promo: Promos = {
                nazwa,
                rozpoczecie: start,
                wygasa: end,
                aktywna,
            };

            if (typPromocji === "standard") {
                promo.procent = procent;
            } else {
                const special: SpecjalnaPromocja = {
                    nazwa: specialNazwa || nazwa,
                    warunek,
                    obniza_cene: obnizaCene,
                    zmienia_cene: zmieniaCene,
                };
                if (obnizaCene && obnizka !== undefined) special.obnizka = obnizka;
                if (zmieniaCene && nowaCena !== undefined) special.nowa_cena = nowaCena;
                promo.special = special;
            }

            const res = await fetch("/admin/api/v1/promo/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(promo),
            }).then((r) => r.json());

            if (res.status === 0) {
                router.push("/admin/manage/promocje");
            } else {
                alert(res.error || res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Błąd podczas zapisywania promocji.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj promocję
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o promocji. Możesz utworzyć
                    promocję procentową lub specjalną (warunkową).
                </p>
            </div>

            <form
                onSubmit={sendNewPromo}
                className="grid gap-4 rounded-lg border p-3 sm:p-4 sm:grid-cols-2"
            >
                {/* Nazwa */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa *</label>
                    <input
                        type="text"
                        value={nazwa}
                        onChange={(e) => setNazwa(e.target.value)}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Black Friday -20%"
                    />
                </div>

                {/* Typ promocji */}
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Typ promocji *</label>
                    <select
                        value={typPromocji}
                        onChange={(e) =>
                            setTypPromocji(e.target.value as TypPromocji)
                        }
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                    >
                        <option value="standard">Standardowa (procent)</option>
                        <option value="specjalna">Specjalna (warunkowa)</option>
                    </select>
                </div>

                {/* Standard: procent */}
                {typPromocji === "standard" && (
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">Procent *</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={procent}
                            onChange={(e) =>
                                setProcent(parseInt(e.target.value, 10) || 0)
                            }
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            placeholder="25"
                        />
                    </div>
                )}

                {/* Specjalna: warunek + obniżka/nowa cena */}
                {typPromocji === "specjalna" && (
                    <>
                        <div className="grid gap-2 sm:col-span-2">
                            <label className="text-sm font-medium">
                                Nazwa warunku (opis)
                            </label>
                            <input
                                type="text"
                                value={specialNazwa}
                                onChange={(e) => setSpecialNazwa(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="Np. Kup 3 szt."
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Warunek (np. min. ilość) *
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={warunek}
                                onChange={(e) =>
                                    setWarunek(
                                        parseInt(e.target.value, 10) || 0,
                                    )
                                }
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                placeholder="0"
                            />
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <div className="flex items-center gap-2 p-3 border rounded-md">
                                <input
                                    type="checkbox"
                                    id="obniza_cene"
                                    checked={obnizaCene}
                                    onChange={(e) =>
                                        setObnizaCene(e.target.checked)
                                    }
                                    className="w-4 h-4"
                                />
                                <label
                                    htmlFor="obniza_cene"
                                    className="text-sm font-medium"
                                >
                                    Obniża cenę (rabat)
                                </label>
                            </div>
                            {obnizaCene && (
                                <div className="pl-4">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Obniżka (kwota lub %)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={obnizka}
                                        onChange={(e) =>
                                            setObnizka(
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2 sm:col-span-2">
                            <div className="flex items-center gap-2 p-3 border rounded-md">
                                <input
                                    type="checkbox"
                                    id="zmienia_cene"
                                    checked={zmieniaCene}
                                    onChange={(e) =>
                                        setZmieniaCene(e.target.checked)
                                    }
                                    className="w-4 h-4"
                                />
                                <label
                                    htmlFor="zmienia_cene"
                                    className="text-sm font-medium"
                                >
                                    Zmienia cenę (stała nowa cena)
                                </label>
                            </div>
                            {zmieniaCene && (
                                <div className="pl-4">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Nowa cena
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        value={nowaCena}
                                        onChange={(e) =>
                                            setNowaCena(
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Daty */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Rozpoczęcie promocji *
                    </label>
                    <input
                        type="date"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        value={start.toISOString().slice(0, 10)}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) =>
                            setStart(new Date(e.target.value + "T00:00:00"))
                        }
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Zakończenie promocji *
                    </label>
                    <input
                        type="date"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        value={end.toISOString().slice(0, 10)}
                        min={start.toISOString().slice(0, 10)}
                        onChange={(e) =>
                            setEnd(new Date(e.target.value + "T23:59:59"))
                        }
                        required
                    />
                </div>

                {/* Aktywna */}
                <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                        type="checkbox"
                        id="aktywna"
                        checked={aktywna}
                        onChange={(e) => setAktywna(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label
                        htmlFor="aktywna"
                        className="text-sm font-medium"
                    >
                        Promocja aktywna
                    </label>
                </div>

                {/* Submit */}
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                    >
                        {isSubmitting ? "Zapisywanie..." : "Zapisz promocję"}
                    </button>
                </div>
            </form>
        </div>
    );
}
