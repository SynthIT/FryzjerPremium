"use client";

import { useState } from "react";
import {
    CenaTyp,
    pricePreviewLabel,
    toDisplayPrice,
    toStoredNetPrice,
} from "@/lib/admin/pricing";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

type Variant = "page" | "modal";

interface AdminPriceVatFieldsProps {
    label: string;
    required?: boolean;
    storedNetValue: number;
    vatPercent: number;
    cenaTyp: CenaTyp;
    onStoredNetChange: (net: number) => void;
    onCenaTypChange: (typ: CenaTyp) => void;
    variant?: Variant;
    className?: string;
    /** Etykieta podglądu (np. „Cena skupu”) */
    previewPrefix?: string;
}

function parsePriceInput(text: string): number {
    const normalized = text.trim().replace(",", ".");
    if (!normalized) return 0;
    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
}

function formatDisplayValue(value: number): string {
    if (!value) return "";
    return String(value);
}

export default function AdminPriceVatFields({
    label,
    required = false,
    storedNetValue,
    vatPercent,
    cenaTyp,
    onStoredNetChange,
    onCenaTypChange,
    variant = "page",
    className = "",
    previewPrefix,
}: AdminPriceVatFieldsProps) {
    const inputClass = variant === "page" ? adminInputClass : adminModalInputClass;
    const displayValue = toDisplayPrice(storedNetValue, cenaTyp, vatPercent);
    const [draft, setDraft] = useState<string | null>(null);
    const [prevVat, setPrevVat] = useState(vatPercent);
    const [prevCenaTyp, setPrevCenaTyp] = useState(cenaTyp);

    if (vatPercent !== prevVat || cenaTyp !== prevCenaTyp) {
        setPrevVat(vatPercent);
        setPrevCenaTyp(cenaTyp);
        setDraft(null);
    }

    const isEditing = draft !== null;
    const inputText = isEditing ? draft : formatDisplayValue(displayValue);

    const commitInput = (text: string) => {
        const raw = parsePriceInput(text);
        onStoredNetChange(toStoredNetPrice(raw, cenaTyp, vatPercent));
    };

    const previewNet =
        isEditing && inputText.trim() !== ""
            ? toStoredNetPrice(parsePriceInput(inputText), cenaTyp, vatPercent)
            : storedNetValue;
    const preview = pricePreviewLabel(previewNet, cenaTyp, vatPercent);
    const previewText = previewPrefix ? preview.replace(/^Cena/, previewPrefix) : preview;

    return (
        <div className={className}>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    inputMode="decimal"
                    value={inputText}
                    onFocus={() => setDraft(formatDisplayValue(displayValue))}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                        if (draft !== null) {
                            commitInput(draft);
                        }
                        setDraft(null);
                    }}
                    required={required}
                    className={
                        variant === "page"
                            ? `${inputClass} flex-1`
                            : `${inputClass}`
                    }
                    placeholder="0.00"
                />
                <select
                    className={
                        variant === "page"
                            ? "w-1/3 rounded-md border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                            : "w-28 px-2 py-2 border rounded-md text-sm shrink-0"
                    }
                    value={cenaTyp}
                    onChange={(e) => onCenaTypChange(e.target.value as CenaTyp)}
                    required={required}>
                    <option value="brutto">Brutto</option>
                    <option value="netto">Netto</option>
                </select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{previewText}</p>
        </div>
    );
}
