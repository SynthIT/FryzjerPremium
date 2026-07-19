import { Warianty } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";

/** Czy promocja jest aktywna i mieści się w oknie dat. */
export function isPromoApplicable(promocje?: Promos | null): boolean {
    if (!promocje) return false;
    if (promocje.aktywna === false) return false;
    const now = Date.now();
    if (promocje.wygasa && new Date(promocje.wygasa).getTime() < now) return false;
    if (promocje.rozpoczecie && new Date(promocje.rozpoczecie).getTime() > now) {
        return false;
    }
    return true;
}

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
    const promo = isPromoApplicable(promocje) ? promocje : null;
    if (promo?.procent != null && promo.procent !== 0) {
        base = base * ((100 - promo.procent) / 100);
    }
    if (promo?.special?.obniza_cene && promo.special.obnizka) {
        base = base - (base * promo.special.obnizka) / 100;
    }
    if (promo?.special?.zmienia_cene && promo.special.nowa_cena != null) {
        base = promo.special.nowa_cena;
    }
    return Math.round((base + (base * vat) / 100) * 100) / 100;
}
