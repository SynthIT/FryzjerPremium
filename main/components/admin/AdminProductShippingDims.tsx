"use client";

import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

export type ShippingDims = {
    szerokosc: number; // X cm
    wysokosc: number; // Y cm
    dlugosc: number; // Z cm
    waga: number; // kg
};

type Variant = "page" | "modal";

interface Props {
    value: Partial<ShippingDims>;
    onChange: (next: ShippingDims) => void;
    variant?: Variant;
}

function num(v: unknown): number {
    const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : 0;
}

/** Obligatoryjne wymiary paczki (X/Y/Z + waga) w sekcji Specyfikacja. */
export default function AdminProductShippingDims({
    value,
    onChange,
    variant = "page",
}: Props) {
    const inputClass = variant === "page" ? adminInputClass : adminModalInputClass;

    const patch = (key: keyof ShippingDims, raw: string) => {
        const next = {
            szerokosc: num(value.szerokosc),
            wysokosc: num(value.wysokosc),
            dlugosc: num(value.dlugosc),
            waga: num(value.waga),
            [key]: parseFloat(raw) || 0,
        };
        onChange(next);
    };

    const field = (
        label: string,
        key: keyof ShippingDims,
        unit: string,
        placeholder: string,
    ) => (
        <div className="grid gap-1.5">
            <label className="text-sm font-medium">
                {label} <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder={placeholder}
                    value={value[key] === 0 || value[key] == null ? "" : value[key]}
                    onChange={(e) => patch(key, e.target.value)}
                    className={`w-full ${inputClass}`}
                />
                <span className="text-xs text-muted-foreground shrink-0 w-8">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                Wymiary paczki do wyceny i nadania Apaczka (obowiązkowe). X = szerokość, Y =
                wysokość, Z = długość/głębokość.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {field("X — szerokość", "szerokosc", "cm", "np. 20")}
                {field("Y — wysokość", "wysokosc", "cm", "np. 10")}
                {field("Z — długość", "dlugosc", "cm", "np. 30")}
                {field("Waga", "waga", "kg", "np. 0.5")}
            </div>
        </div>
    );
}
