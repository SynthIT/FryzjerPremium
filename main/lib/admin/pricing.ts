import { finalPrice } from "@/lib/utils";
import { Products } from "@/lib/types/productTypes";

export type CenaTyp = "brutto" | "netto";

/** Kwota w groszach — zawsze max 2 miejsca po przecinku (zapis do DB). */
export function roundMoney(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100) / 100;
}

/** Wartość netto z kwoty wpisanej w formularzu (zależnie od trybu brutto/netto). */
export function toStoredNetPrice(
    displayValue: number,
    cenaTyp: CenaTyp,
    vatPercent: number,
): number {
    if (!Number.isFinite(displayValue) || displayValue <= 0) return 0;
    if (cenaTyp === "netto") return roundMoney(displayValue);
    return grossToNet(displayValue, vatPercent);
}

/** Kwota netto z brutto. */
export function grossToNet(gross: number, vatPercent: number): number {
    if (!Number.isFinite(gross) || vatPercent < 0) return 0;
    return roundMoney(gross / (1 + vatPercent / 100));
}

/** Kwota netto → brutto (bez promocji/wariantów). */
export function netToGross(net: number, vatPercent: number): number {
    if (!Number.isFinite(net) || vatPercent < 0) return 0;
    return Math.round(net * (1 + vatPercent / 100) * 100) / 100;
}

/** Wartość do pokazania w polu input (netto w DB → brutto w UI gdy tryb brutto). */
export function toDisplayPrice(storedNet: number, cenaTyp: CenaTyp, vatPercent: number): number {
    if (!storedNet) return 0;
    if (cenaTyp === "netto") return storedNet;
    return netToGross(storedNet, vatPercent);
}

/** Podgląd drugiej kwoty (jak w formularzu produktu). */
export function pricePreviewLabel(
    storedNet: number,
    cenaTyp: CenaTyp,
    vatPercent: number,
): string {
    if (cenaTyp === "netto") {
        return `Cena z VAT: ${finalPrice(storedNet, vatPercent, undefined, undefined)} zł`;
    }
    const bezVat = storedNet ? (storedNet / (1 + vatPercent / 100)).toFixed(2) : "0.00";
    return `Cena bez VAT: ${bezVat} zł`;
}

/** Normalizuje warianty przed zapisem — pola cenowe są zawsze netto w DB. */
export function normalizeVariantPricesForSave(
    warianty: Array<{
        nadpisuje_cene?: boolean;
        nowa_cena?: number;
        inna_cena_skupu?: boolean;
        cena_skupu?: number;
        [key: string]: unknown;
    }>,
    cenaTyp: CenaTyp,
    vatPercent: number,
) {
    return warianty.map((w) => {
        const copy = { ...w };
        if (copy.nadpisuje_cene && copy.nowa_cena != null) {
            copy.nowa_cena = toStoredNetPrice(copy.nowa_cena, cenaTyp, vatPercent);
        }
        if (copy.inna_cena_skupu && copy.cena_skupu != null) {
            copy.cena_skupu = toStoredNetPrice(copy.cena_skupu, cenaTyp, vatPercent);
        }
        return copy;
    });
}

/** Zaokrągla ceny produktu i wariantów przed zapisem (create/update). */
export function normalizeProductPrices<T extends Products>(product: T): T {
    const wariant = product.wariant?.map((w) => {
        const copy = { ...w };
        if (copy.nowa_cena != null) {
            copy.nowa_cena = roundMoney(copy.nowa_cena);
        }
        if (copy.cena_skupu != null) {
            copy.cena_skupu = roundMoney(copy.cena_skupu);
        }
        return copy;
    });

    return {
        ...product,
        cena: roundMoney(product.cena),
        cena_skupu: roundMoney(product.cena_skupu),
        ...(wariant ? { wariant } : {}),
    };
}
