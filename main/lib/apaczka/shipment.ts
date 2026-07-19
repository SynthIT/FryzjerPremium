import type { ApaczkaShipment } from "./types";

/** Wymiary paczki produktu (cm / kg) — mapowanie na Apaczka shipment. */
export type ProductPackageDims = {
    /** X — szerokość [cm] → dimension2 */
    szerokosc: number;
    /** Y — wysokość [cm] → dimension3 */
    wysokosc: number;
    /** Z — długość/głębokość [cm] → dimension1 */
    dlugosc: number;
    /** waga [kg] */
    waga: number;
};

const FALLBACK: ProductPackageDims = {
    szerokosc: 20,
    wysokosc: 10,
    dlugosc: 30,
    waga: 1,
};

export function hasValidPackageDims(
    p: Partial<ProductPackageDims> | null | undefined,
): p is ProductPackageDims {
    if (!p) return false;
    return (
        Number(p.szerokosc) > 0 &&
        Number(p.wysokosc) > 0 &&
        Number(p.dlugosc) > 0 &&
        Number(p.waga) > 0
    );
}

export function toApaczkaShipment(
    dims: Partial<ProductPackageDims> | null | undefined,
): ApaczkaShipment {
    const d = hasValidPackageDims(dims) ? dims : FALLBACK;
    return {
        dimension1: Number(d.dlugosc),
        dimension2: Number(d.szerokosc),
        dimension3: Number(d.wysokosc),
        weight: Number(d.waga),
        shipment_type_code: "PACZKA",
    };
}

/**
 * Buduje listę paczek: każda sztuka produktu = osobna paczka o wymiarach produktu.
 */
export function buildShipmentsFromProducts(
    lines: Array<{ dims: Partial<ProductPackageDims> | null | undefined; quantity: number }>,
): ApaczkaShipment[] {
    const out: ApaczkaShipment[] = [];
    for (const line of lines) {
        const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
        const shipment = toApaczkaShipment(line.dims);
        for (let i = 0; i < qty; i++) {
            out.push({ ...shipment });
        }
    }
    if (out.length === 0) {
        out.push(toApaczkaShipment(FALLBACK));
    }
    return out;
}
