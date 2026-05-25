"use client";

import { SpecjalnaPromocja } from "@/lib/types/shared";
import { adminInputClass } from "./adminFormStyles";

export type TypPromocji = "standard" | "specjalna";

export interface PromoFormState {
    nazwa: string;
    typPromocji: TypPromocji;
    procent: number;
    start: Date;
    end: Date;
    aktywna: boolean;
    specialNazwa: string;
    warunek: number;
    obnizaCene: boolean;
    obnizka: number;
    zmieniaCene: boolean;
    nowaCena: number;
}

interface PromoFormFieldsProps {
    state: PromoFormState;
    onChange: (patch: Partial<PromoFormState>) => void;
}

export default function PromoFormFields({ state, onChange }: PromoFormFieldsProps) {
    const set = (patch: Partial<PromoFormState>) => onChange(patch);

    return (
        <>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Nazwa *</label>
                <input
                    type="text"
                    value={state.nazwa}
                    onChange={(e) => set({ nazwa: e.target.value })}
                    required
                    className={adminInputClass}
                    placeholder="Np. Black Friday -20%"
                />
            </div>
            <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Typ promocji *</label>
                <select
                    value={state.typPromocji}
                    onChange={(e) =>
                        set({ typPromocji: e.target.value as TypPromocji })
                    }
                    className={adminInputClass}>
                    <option value="standard">Standardowa (procent)</option>
                    <option value="specjalna">Specjalna (warunkowa)</option>
                </select>
            </div>
            {state.typPromocji === "standard" && (
                <div className="grid gap-2 sm:col-span-2">
                    <label className="text-sm font-medium">Procent *</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={state.procent}
                        onChange={(e) =>
                            set({ procent: parseInt(e.target.value, 10) || 0 })
                        }
                        required
                        className={adminInputClass}
                        placeholder="25"
                    />
                </div>
            )}
            {state.typPromocji === "specjalna" && (
                <>
                    <div className="grid gap-2 sm:col-span-2">
                        <label className="text-sm font-medium">
                            Nazwa warunku (opis)
                        </label>
                        <input
                            type="text"
                            value={state.specialNazwa}
                            onChange={(e) => set({ specialNazwa: e.target.value })}
                            className={adminInputClass}
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
                            value={state.warunek}
                            onChange={(e) =>
                                set({
                                    warunek: parseInt(e.target.value, 10) || 0,
                                })
                            }
                            className={adminInputClass}
                        />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <div className="flex items-center gap-2 p-3 border rounded-md">
                            <input
                                type="checkbox"
                                id="obniza_cene"
                                checked={state.obnizaCene}
                                onChange={(e) => set({ obnizaCene: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="obniza_cene" className="text-sm font-medium">
                                Obniża cenę (rabat)
                            </label>
                        </div>
                        {state.obnizaCene && (
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={state.obnizka}
                                onChange={(e) =>
                                    set({
                                        obnizka: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className={adminInputClass}
                            />
                        )}
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <div className="flex items-center gap-2 p-3 border rounded-md">
                            <input
                                type="checkbox"
                                id="zmienia_cene"
                                checked={state.zmieniaCene}
                                onChange={(e) => set({ zmieniaCene: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="zmienia_cene" className="text-sm font-medium">
                                Zmienia cenę (stała nowa cena)
                            </label>
                        </div>
                        {state.zmieniaCene && (
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={state.nowaCena}
                                onChange={(e) =>
                                    set({
                                        nowaCena: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className={adminInputClass}
                            />
                        )}
                    </div>
                </>
            )}
            <div className="grid gap-2">
                <label className="text-sm font-medium">Rozpoczęcie promocji *</label>
                <input
                    type="date"
                    className={adminInputClass}
                    value={state.start.toISOString().slice(0, 10)}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                        set({ start: new Date(e.target.value + "T00:00:00") })
                    }
                    required
                />
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Zakończenie promocji *</label>
                <input
                    type="date"
                    className={adminInputClass}
                    value={state.end.toISOString().slice(0, 10)}
                    min={state.start.toISOString().slice(0, 10)}
                    onChange={(e) =>
                        set({ end: new Date(e.target.value + "T23:59:59") })
                    }
                    required
                />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
                <input
                    type="checkbox"
                    id="aktywna"
                    checked={state.aktywna}
                    onChange={(e) => set({ aktywna: e.target.checked })}
                    className="w-4 h-4"
                />
                <label htmlFor="aktywna" className="text-sm font-medium">
                    Promocja aktywna
                </label>
            </div>
        </>
    );
}

/** Buduje obiekt Promos do API z stanu formularza. */
export function buildPromoPayload(state: PromoFormState) {
    const promo: {
        nazwa: string;
        rozpoczecie: Date;
        wygasa: Date;
        aktywna: boolean;
        procent?: number;
        special?: SpecjalnaPromocja;
    } = {
        nazwa: state.nazwa,
        rozpoczecie: state.start,
        wygasa: state.end,
        aktywna: state.aktywna,
    };
    if (state.typPromocji === "standard") {
        promo.procent = state.procent;
    } else {
        const special: SpecjalnaPromocja = {
            nazwa: state.specialNazwa || state.nazwa,
            warunek: state.warunek,
            obniza_cene: state.obnizaCene,
            zmienia_cene: state.zmieniaCene,
        };
        if (state.obnizaCene) special.obnizka = state.obnizka;
        if (state.zmieniaCene) special.nowa_cena = state.nowaCena;
        promo.special = special;
    }
    return promo;
}
