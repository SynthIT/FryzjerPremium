import { createHmac } from "crypto";
import {
    mockOrderSend,
    mockOrderValuation,
    mockPoints,
    mockServiceStructure,
    mockWaybill,
} from "./mock";
import type {
    ApaczkaApiEnvelope,
    ApaczkaOrderPayload,
    ApaczkaPoint,
    ApaczkaServiceStructure,
    ApaczkaValuationPrice,
} from "./types";

const API_BASE = "https://www.apaczka.pl/api/v2";

function appId() {
    return process.env.APACZKA_APP_ID ?? "";
}
function appSecret() {
    return process.env.APACZKA_APP_SECRET ?? "";
}

/** Brak credentials → tryb suchy (mock zgodny z kształtami API). */
export function isApaczkaDryMode(): boolean {
    return !appId() || !appSecret() || process.env.APACZKA_DRY === "1";
}

function stringToSign(
    id: string,
    route: string,
    data: string,
    expires: number,
): string {
    return `${id}:${route}:${data}:${expires}`;
}

function getSignature(payload: string, key: string): string {
    return createHmac("sha256", key).update(payload).digest("hex");
}

/**
 * Buduje body requestu Apaczka v2 (app_id, request, expires, signature).
 * W trybie dry nie wysyła HTTP — tylko zwraca mock.
 */
export async function apaczkaRequest<T>(
    route: string,
    requestData: unknown = {},
): Promise<ApaczkaApiEnvelope<T>> {
    const data = JSON.stringify(requestData ?? {});
    const expires = Math.floor(Date.now() / 1000) + 25 * 60;

    if (isApaczkaDryMode()) {
        return dryDispatch<T>(route, requestData);
    }

    const id = appId();
    const secret = appSecret();
    const signature = getSignature(
        stringToSign(id, route, data, expires),
        secret,
    );

    const res = await fetch(`${API_BASE}/${route.replace(/^\//, "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            app_id: id,
            request: data,
            expires,
            signature,
        }),
    });

    const json = (await res.json()) as ApaczkaApiEnvelope<T>;
    return json;
}

function dryDispatch<T>(route: string, requestData: unknown): ApaczkaApiEnvelope<T> {
    const r = route.replace(/^\/+|\/+$/g, "");

    if (r === "service_structure") {
        return mockServiceStructure() as ApaczkaApiEnvelope<T>;
    }

    if (r.startsWith("points/")) {
        const type = r.split("/")[1] || "INPOST";
        const q = (requestData ?? {}) as {
            city?: string;
            postal_code?: string;
            country_code?: string;
        };
        return mockPoints(type, q) as ApaczkaApiEnvelope<T>;
    }

    if (r === "order_valuation") {
        const order = (requestData as { order?: ApaczkaOrderPayload })?.order;
        if (!order) {
            return {
                status: 400,
                message: "Brak struktury order",
                response: {} as T,
            };
        }
        return mockOrderValuation(order) as ApaczkaApiEnvelope<T>;
    }

    if (r === "order_send") {
        const order = (requestData as { order?: ApaczkaOrderPayload })?.order;
        if (!order) {
            return {
                status: 400,
                message: "Brak struktury order",
                response: {} as T,
            };
        }
        return mockOrderSend(order) as ApaczkaApiEnvelope<T>;
    }

    if (r.startsWith("waybill/")) {
        const orderId = r.split("/")[1] || "unknown";
        const meta = (requestData ?? {}) as {
            nrzam?: string;
            waybillNumber?: string;
        };
        return mockWaybill(orderId, meta) as ApaczkaApiEnvelope<T>;
    }

    return {
        status: 400,
        message: `Dry mode: endpoint „${route}” niezaimplementowany w mocku`,
        response: {} as T,
    };
}

export async function getServiceStructure() {
    return apaczkaRequest<ApaczkaServiceStructure>("service_structure/", {});
}

export async function getPoints(
    type: string,
    opts?: { country_code?: string; city?: string; postal_code?: string },
) {
    return apaczkaRequest<{ points: Record<string, ApaczkaPoint> }>(
        `points/${type}/`,
        {
            country_code: opts?.country_code ?? "PL",
            ...(opts?.city ? { city: opts.city } : {}),
            ...(opts?.postal_code ? { postal_code: opts.postal_code } : {}),
        },
    );
}

export async function getOrderValuation(order: ApaczkaOrderPayload) {
    return apaczkaRequest<{
        price_table: Record<string, ApaczkaValuationPrice>;
    }>("order_valuation/", { order });
}

export async function sendOrder(order: ApaczkaOrderPayload) {
    return apaczkaRequest<{
        order: {
            id: string;
            service_id?: string | number;
            service_name?: string;
            waybill_number: string;
            tracking_url: string;
            status?: string;
            dry?: boolean;
        };
    }>("order_send/", { order });
}

/** List przewozowy (base64 PDF) — bez cache Blob; wywołuj przy pobraniu. */
export async function getWaybill(
    orderId: string,
    meta?: { nrzam?: string; waybillNumber?: string },
) {
    return apaczkaRequest<{ waybill: string; type: string }>(
        `waybill/${orderId}/`,
        meta ?? {},
    );
}
