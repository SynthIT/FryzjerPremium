"use client";

import { useState } from "react";
import "@/app/globals2.css";
import { Promos } from "@/lib/models/Products";

export default function NewProductPage() {
    const [nazwa, setNazwa] = useState<string>("");
    const [procent, setProcent] = useState<number>(0);
    const [start, setStart] = useState<Date>(() => {
        return new Date(Date.now());
    });
    const [end, setEnd] = useState<Date>(() => {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    });
    const [aktywna, setAktywna] = useState<boolean>(true);

    const sendNewPromo = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const promo: Promos = {
            nazwa: nazwa,
            procent: procent,
            rozpoczecie: start,
            wygasa: end,
        };
        const res = await fetch("/admin/api/v1/promo/", {
            method: "post",
            body: JSON.stringify(promo),
        }).then((res) => {
            return res.json();
        });
        if (res.status == 0) {
            document.location.href = "/admin/manage/promocje";
        } else {
            alert(res.error || res.message);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Dodaj promocje
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Uzupełnij podstawowe informacje o promocji.
                </p>
            </div>

            <form className="grid gap-4 rounded-md border p-3 sm:p-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Nazwa*</label>
                    <input
                        value={nazwa}
                        onChange={(v) => {
                            setNazwa(v.target.value);
                        }}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="Np. Szampon wygładzający"
                    />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Procent*</label>
                    <input
                        type="number"
                        value={procent}
                        onChange={(v) => {
                            setProcent(parseInt(v.target.value));
                        }}
                        required
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        placeholder="25"
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Rozpoczęcie promocji*
                    </label>
                    <input
                        type="date"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        value={start.toISOString().slice(0, 10)}
                        min={start.toISOString().slice(0, 10)}
                        onChange={(e) => setStart(new Date(e.target.value))}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <label className="text-sm font-medium">
                        Zakończenie promocji*
                    </label>
                    <input
                        type="date"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                        value={end.toISOString().slice(0, 10)}
                        min={start.toISOString().slice(0, 10)}
                        onChange={(e) => setEnd(new Date(e.target.value))}
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <button
                        onClick={sendNewPromo}
                        type="submit"
                        className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                        Zapisz produkt
                    </button>
                </div>
            </form>
        </div>
    );
}
