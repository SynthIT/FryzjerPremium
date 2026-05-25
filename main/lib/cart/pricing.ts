import { Warianty } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";

/** Brutto linii koszyka — ta sama logika co `finalPrice` w sklepie. */
export function linePriceBrutto(
    cenaNetto: number,
    vat: number,
    wariant?: Warianty,
    promocje?: Promos | null,
): number {
    let base = cenaNetto;
    if (wariant?.nadpisuje_cene && wariant.nowa_cena != null) {
        base = wariant.nowa_cena;
    }
    if (promocje?.procent != null && promocje.procent !== 0) {
        base = base * ((100 - promocje.procent) / 100);
    }
    if (promocje?.special?.obniza_cene && promocje.special.obnizka) {
        base = base - (base * promocje.special.obnizka) / 100;
    }
    if (promocje?.special?.zmienia_cene && promocje.special.nowa_cena != null) {
        base = promocje.special.nowa_cena;
    }
    return Math.round((base + (base * vat) / 100) * 100) / 100;
}
