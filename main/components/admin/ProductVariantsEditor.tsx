"use client";

import { Plus, HelpCircle } from "lucide-react";
import { Warianty } from "@/lib/types/productTypes";
import { generateSlug } from "@/lib/utils_admin";
import {
    CenaTyp,
    pricePreviewLabel,
    toDisplayPrice,
    toStoredNetPrice,
} from "@/lib/admin/pricing";
import { adminInputClass, adminModalInputClass } from "./adminFormStyles";

type Variant = "page" | "modal";

const EMPTY_WARIANT: Warianty = {
    nazwa: "",
    slug: "",
    typ: "kolor",
    ilosc: 0,
    nadpisuje_cene: false,
    inna_cena_skupu: false,
};

interface ProductVariantsEditorProps {
    warianty: Warianty[];
    onChange: (warianty: Warianty[]) => void;
    vatPercent: number;
    cenaTyp: CenaTyp;
    variant?: Variant;
    /** W edycji: pierwszy wariant synchronizuje ilość z produktem */
    lockFirstVariantQty?: boolean;
    showSectionHeader?: boolean;
}

function VariantPriceInput({
    label,
    storedNet,
    vatPercent,
    cenaTyp,
    onChange,
    inputClass,
}: {
    label: string;
    storedNet: number | undefined;
    vatPercent: number;
    cenaTyp: CenaTyp;
    onChange: (net: number | undefined) => void;
    inputClass: string;
}) {
    const net = storedNet ?? 0;
    const display = toDisplayPrice(net, cenaTyp, vatPercent);

    return (
        <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs shrink-0">{label}</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={display || ""}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                            onChange(undefined);
                            return;
                        }
                        const parsed = parseFloat(raw) || 0;
                        onChange(toStoredNetPrice(parsed, cenaTyp, vatPercent));
                    }}
                    className={`flex-1 min-w-[6rem] ${inputClass}`}
                />
                <span className="text-[10px] text-muted-foreground uppercase">
                    {cenaTyp}
                </span>
            </div>
            {net > 0 && (
                <p className="text-[10px] text-muted-foreground">
                    {pricePreviewLabel(net, cenaTyp, vatPercent)}
                </p>
            )}
        </div>
    );
}

export default function ProductVariantsEditor({
    warianty,
    onChange,
    vatPercent,
    cenaTyp,
    variant = "page",
    lockFirstVariantQty = false,
    showSectionHeader = true,
}: ProductVariantsEditorProps) {
    const inputClass = variant === "page" ? adminInputClass : adminModalInputClass;
    const addBtnClass =
        variant === "page"
            ? "px-3 py-2 text-xs bg-primary border-2 text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1"
            : "px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1";

    const addWariant = () => onChange([...warianty, { ...EMPTY_WARIANT }]);

    const updateWariant = (
        index: number,
        field: keyof Warianty,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
    ) => {
        const updated = [...warianty];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "nazwa" && value) {
            updated[index].slug = generateSlug(String(value));
        }
        onChange(updated);
    };

    const removeWariant = (index: number) =>
        onChange(warianty.filter((_, i) => i !== index));

    const priceHint =
        cenaTyp === "netto"
            ? "wartości zapisywane jako netto w bazie"
            : "wpisujesz brutto — zapis jako netto";

    return (
        <div className="space-y-4">
            {showSectionHeader && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Warianty</label>
                    <button type="button" onClick={addWariant} className={addBtnClass}>
                        <Plus className="h-3 w-3" />
                        Dodaj wariant
                    </button>
                </div>
            )}
            {!showSectionHeader && (
                <button type="button" onClick={addWariant} className={addBtnClass}>
                    <Plus className={variant === "page" ? "h-3 w-3" : "h-4 w-4"} />
                    Dodaj wariant
                </button>
            )}
            <p className="text-xs text-muted-foreground">
                Ceny wariantów ({priceHint}), VAT produktu: {vatPercent}%
            </p>
            {warianty.map((wariant, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-xs font-medium">Nazwa wariantu *</label>
                            <input
                                type="text"
                                value={wariant.nazwa}
                                onChange={(e) =>
                                    updateWariant(index, "nazwa", e.target.value)
                                }
                                className={inputClass}
                                placeholder="Np. Czerwony"
                            />
                        </div>
                        <div>
                            <label
                                className="text-xs font-medium flex items-center gap-1 p-1"
                                title={
                                    lockFirstVariantQty && index === 0
                                        ? "Nie można edytować ilości głównego wariantu, pole do tego jest na górze."
                                        : undefined
                                }>
                                Ilosc *{" "}
                                {lockFirstVariantQty && index === 0 ? (
                                    <>
                                        główny wariant
                                        <HelpCircle className="w-4 h-4" />
                                    </>
                                ) : null}
                            </label>
                            <input
                                type="number"
                                disabled={lockFirstVariantQty && index === 0}
                                title={
                                    lockFirstVariantQty && index === 0
                                        ? "Nie można edytować ilości głównego wariantu"
                                        : undefined
                                }
                                value={wariant.ilosc}
                                onChange={(e) =>
                                    updateWariant(
                                        index,
                                        "ilosc",
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium">Typ *</label>
                            <select
                                value={wariant.typ}
                                onChange={(e) =>
                                    updateWariant(
                                        index,
                                        "typ",
                                        e.target.value as Warianty["typ"],
                                    )
                                }
                                className={inputClass}>
                                <option value="kolor">Kolor</option>
                                <option value="rozmiar">Rozmiar</option>
                                <option value="objetosc">Objętość</option>
                                <option value="specjalna">Specjalna</option>
                                <option value="hurt">Hurt</option>
                            </select>
                        </div>
                    </div>

                    {wariant.typ === "kolor" && (
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Nazwa koloru"
                                value={wariant.kolory?.name || ""}
                                onChange={(e) =>
                                    updateWariant(index, "kolory", {
                                        name: e.target.value,
                                        val: wariant.kolory?.val ?? e.target.value,
                                        hex: wariant.kolory?.hex ?? "#000000",
                                    })
                                }
                                className={inputClass}
                            />
                            <input
                                type="text"
                                placeholder="Wartość"
                                value={wariant.kolory?.val ?? wariant.kolory?.hex ?? ""}
                                disabled={variant === "page"}
                                onChange={(e) =>
                                    updateWariant(index, "kolory", {
                                        ...wariant.kolory,
                                        name: wariant.kolory?.name ?? "",
                                        val: e.target.value,
                                        hex: wariant.kolory?.hex ?? null,
                                    })
                                }
                                className={inputClass}
                            />
                            <input
                                type="color"
                                value={wariant.kolory?.hex || "#000000"}
                                onChange={(e) =>
                                    updateWariant(index, "kolory", {
                                        name: wariant.kolory?.name ?? "",
                                        val: e.target.value,
                                        hex: e.target.value,
                                    })
                                }
                                className="rounded-md border bg-background h-10"
                            />
                        </div>
                    )}

                    {wariant.typ === "rozmiar" && (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Nazwa rozmiaru"
                                value={wariant.rozmiary?.name || ""}
                                onChange={(e) =>
                                    updateWariant(index, "rozmiary", {
                                        name: e.target.value,
                                        val: e.target.value,
                                        hex: null,
                                    })
                                }
                                className={inputClass}
                            />
                            <input
                                type="text"
                                placeholder="Wartość"
                                value={wariant.rozmiary?.val || ""}
                                onChange={(e) =>
                                    updateWariant(index, "rozmiary", {
                                        name: wariant.rozmiary?.name ?? "",
                                        val: e.target.value,
                                        hex: null,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    )}

                    {wariant.typ === "objetosc" && (
                        <input
                            type="number"
                            placeholder="Objętość (ml)"
                            value={
                                wariant.objetosc === 0 ||
                                wariant.objetosc === undefined
                                    ? ""
                                    : wariant.objetosc
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                updateWariant(
                                    index,
                                    "objetosc",
                                    val === "" ? undefined : parseFloat(val) || 0,
                                );
                            }}
                            className={inputClass}
                        />
                    )}

                    <div className="flex items-start gap-2 flex-wrap">
                        <input
                            type="checkbox"
                            checked={wariant.nadpisuje_cene || false}
                            onChange={(e) =>
                                updateWariant(index, "nadpisuje_cene", e.target.checked)
                            }
                            className="w-4 h-4 mt-2"
                        />
                        <label className="text-xs mt-2">Nadpisuje cenę</label>
                        {wariant.nadpisuje_cene && (
                            <VariantPriceInput
                                label="Nowa cena"
                                storedNet={wariant.nowa_cena}
                                vatPercent={vatPercent}
                                cenaTyp={cenaTyp}
                                onChange={(net) =>
                                    updateWariant(index, "nowa_cena", net)
                                }
                                inputClass={inputClass}
                            />
                        )}
                    </div>

                    <div className="flex items-start gap-2 flex-wrap">
                        <input
                            type="checkbox"
                            checked={wariant.inna_cena_skupu || false}
                            onChange={(e) =>
                                updateWariant(
                                    index,
                                    "inna_cena_skupu",
                                    e.target.checked,
                                )
                            }
                            className="w-4 h-4 mt-2"
                        />
                        <label className="text-xs mt-2">
                            Inna cena skupu (analityka)
                        </label>
                        {wariant.inna_cena_skupu && (
                            <VariantPriceInput
                                label="Cena skupu"
                                storedNet={wariant.cena_skupu}
                                vatPercent={vatPercent}
                                cenaTyp={cenaTyp}
                                onChange={(net) =>
                                    updateWariant(index, "cena_skupu", net)
                                }
                                inputClass={inputClass}
                            />
                        )}
                    </div>

                    {(wariant.typ === "hurt" || wariant.typ === "specjalna") && (
                        <div>
                            <label className="text-xs font-medium">
                                Permisje (opcjonalnie)
                            </label>
                            <input
                                type="number"
                                placeholder="Kod permisji"
                                value={wariant.permisje ?? ""}
                                onChange={(e) =>
                                    updateWariant(
                                        index,
                                        "permisje",
                                        parseInt(e.target.value) || undefined,
                                    )
                                }
                                className={inputClass}
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => removeWariant(index)}
                        className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50">
                        Usuń wariant
                    </button>
                </div>
            ))}
        </div>
    );
}
