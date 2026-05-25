import { Products, Warianty } from "@/lib/types/productTypes";

export const VIRTUAL_BASE_VARIANT_SLUG = "pdostw";

export function findVariantIndexBySlug(
    warianty: Warianty[] | undefined,
    slug: string,
): number {
    if (!warianty?.length) return -1;
    return warianty.findIndex((w) => w.slug === slug);
}

/**
 * Dostępny stan do zakupu (bez Mongoose — OK na kliencie):
 * - bez wariantów → `productIlosc`
 * - pierwszy wariant → min(`productIlosc`, `wariant[0].ilosc`) — stan magazynowy + zabezpieczenie przed rozjazdem w DB
 * - pozostałe → `wariant.ilosc`
 */
export function availableQuantity(
    productIlosc: number,
    warianty: Warianty[] | undefined,
    variantIndex: number,
    wariant?: Warianty,
): number {
    const list = warianty ?? [];
    if (list.length === 0) return Math.max(0, productIlosc);
    if (variantIndex < 0) return 0;
    if (variantIndex === 0) {
        const v0 = list[0]?.ilosc;
        if (v0 != null && Number.isFinite(v0)) {
            return Math.max(0, Math.min(productIlosc, v0));
        }
        return Math.max(0, productIlosc);
    }
    return Math.max(0, wariant?.ilosc ?? 0);
}

export function variantIndex(
    warianty: Warianty[],
    selected?: Warianty,
): number {
    if (warianty.length === 0) return -1;
    if (!selected?.slug || selected.slug === VIRTUAL_BASE_VARIANT_SLUG) return 0;
    const idx = warianty.findIndex((w) => w.slug === selected.slug);
    return idx >= 0 ? idx : 0;
}

export function maxAvailableForSelection(
    productIlosc: number,
    warianty: Warianty[] | Warianty | undefined,
    selected?: Warianty,
): number {
    if (!warianty) return availableQuantity(productIlosc, undefined, 0);
    const list = Array.isArray(warianty) ? warianty : [warianty];
    const index = variantIndex(list, selected);
    const w =
        index >= 0 && list[index] ? list[index] : selected;
    return availableQuantity(productIlosc, list, index, w);
}

/** Pierwszy wariant = stan magazynowy produktu (admin). */
export function syncPrimaryVariantStock<
    T extends Products & { ilosc: number; wariant?: Warianty[] },
>(product: T): T {
    if (!product.wariant?.length) return product;
    const next = [...product.wariant];
    next[0] = { ...next[0], ilosc: product.ilosc };
    return { ...product, wariant: next };
}
