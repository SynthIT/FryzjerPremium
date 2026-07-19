/**
 * Cache Apaczka (services / points / valuation) do zamknięcia karty —
 * sessionStorage + deduplikacja równoległych requestów.
 */

type CacheBucket = Record<string, unknown>;

const PREFIX = "apaczka-cache:v1:";
const inflight = new Map<string, Promise<unknown>>();

function storageKey(kind: string, key: string) {
    return `${PREFIX}${kind}:${key}`;
}

function readCache<T>(kind: string, key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(storageKey(kind, key));
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function writeCache(kind: string, key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(storageKey(kind, key), JSON.stringify(value));
    } catch {
        // quota / private mode — ignore
    }
}

async function cachedFetchJson<T>(
    kind: string,
    key: string,
    fetcher: () => Promise<T>,
): Promise<T> {
    const hit = readCache<T>(kind, key);
    if (hit != null) return hit;

    const flightKey = `${kind}:${key}`;
    const existing = inflight.get(flightKey);
    if (existing) return existing as Promise<T>;

    const promise = fetcher()
        .then((data) => {
            writeCache(kind, key, data);
            return data;
        })
        .finally(() => {
            inflight.delete(flightKey);
        });

    inflight.set(flightKey, promise);
    return promise;
}

export type ServicesCachePayload = {
    status: number;
    dry?: boolean;
    services: unknown[];
    points_type?: string[];
};

export async function fetchApaczkaServicesCached(): Promise<ServicesCachePayload> {
    return cachedFetchJson("services", "all", async () => {
        const res = await fetch("/api/v1/delivery/apaczka/services");
        return res.json();
    });
}

export type PointsCachePayload = {
    status: number;
    points: Array<{
        id: string;
        name: string;
        foreign_address_id: string;
        address: {
            line1: string;
            postal_code: string;
            city: string;
        };
        open_hours?: string;
        distance?: number;
    }>;
};

export async function fetchApaczkaPointsCached(opts: {
    type: string;
    city?: string;
    postalCode?: string;
}): Promise<PointsCachePayload> {
    const cityKey = (opts.city || "").trim().toLowerCase().slice(0, 40);
    const pcKey = (opts.postalCode || "").replace(/\s/g, "").slice(0, 6);
    const key = `${opts.type}|${cityKey}|${pcKey}`;

    return cachedFetchJson("points", key, async () => {
        const params = new URLSearchParams({ type: opts.type });
        if (opts.city) params.set("city", opts.city);
        if (opts.postalCode) params.set("postal_code", opts.postalCode);
        const res = await fetch(
            `/api/v1/delivery/apaczka/points?${params.toString()}`,
        );
        return res.json();
    });
}

/** Zaokrąglenie wartości zamówienia — mniej unikalnych kluczy cache. */
function valueBucket(productsTotalPln: number): number {
    return Math.round(productsTotalPln / 10) * 10;
}

export type ValuationCachePayload = {
    status: number;
    price_gross_pln?: number;
    price_net_pln?: number;
};

export async function fetchApaczkaValuationCached(opts: {
    serviceId: string | number;
    productsTotalPln: number;
    weight?: number;
    city?: string;
    postalCode?: string;
    /** Linie produktów — wymiary z DB po stronie API */
    items?: Array<{ product_id?: string; slug?: string; quantity: number }>;
}): Promise<ValuationCachePayload> {
    const itemsKey = (opts.items || [])
        .map((i) => `${i.slug || i.product_id}x${i.quantity}`)
        .sort()
        .join(",");
    const key = [
        String(opts.serviceId),
        valueBucket(opts.productsTotalPln),
        opts.weight ?? 1,
        (opts.city || "").trim().toLowerCase().slice(0, 20),
        (opts.postalCode || "").replace(/\s/g, "").slice(0, 6),
        itemsKey.slice(0, 120),
    ].join("|");

    return cachedFetchJson("valuation", key, async () => {
        const res = await fetch("/api/v1/delivery/apaczka/valuation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: opts.serviceId,
                city: opts.city,
                postal_code: opts.postalCode,
                weight: opts.weight ?? 1,
                shipment_value: Math.round(opts.productsTotalPln * 100),
                items: opts.items,
            }),
        });
        return res.json();
    });
}

/** Prefetch wycen dla listy serwisów (równolegle, z cache). */
export async function prefetchServicePrices(
    serviceIds: Array<string | number>,
    productsTotalPln: number,
    loc?: { city?: string; postalCode?: string },
    items?: Array<{ product_id?: string; slug?: string; quantity: number }>,
): Promise<Record<string, number>> {
    const entries = await Promise.all(
        serviceIds.map(async (id) => {
            const data = await fetchApaczkaValuationCached({
                serviceId: id,
                productsTotalPln,
                city: loc?.city,
                postalCode: loc?.postalCode,
                items,
            });
            const price =
                data.status === 0 && typeof data.price_gross_pln === "number"
                    ? data.price_gross_pln
                    : 0;
            return [String(id), price] as const;
        }),
    );
    return Object.fromEntries(entries);
}

export function peekCachedValuation(
    serviceId: string | number,
    productsTotalPln: number,
): number | null {
    const key = [
        String(serviceId),
        valueBucket(productsTotalPln),
        1,
        "",
        "",
    ].join("|");
    const hit = readCache<ValuationCachePayload>("valuation", key);
    if (hit?.status === 0 && typeof hit.price_gross_pln === "number") {
        return hit.price_gross_pln;
    }
    return null;
}

export type { CacheBucket };
