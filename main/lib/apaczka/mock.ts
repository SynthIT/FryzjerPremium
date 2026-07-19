import type {
    ApaczkaApiEnvelope,
    ApaczkaOrderPayload,
    ApaczkaPoint,
    ApaczkaServiceStructure,
    ApaczkaValuationPrice,
} from "./types";

const MOCK_STRUCTURE: ApaczkaServiceStructure = {
    services: [
        {
            service_id: 41,
            name: "InPost Paczkomat® 24/7",
            delivery_time: "1–2 dni robocze",
            supplier: "INPOST",
            domestic: "1",
            pickup_courier: "0",
            door_to_door: "0",
            door_to_point: "1",
            point_to_point: "1",
            point_to_door: "0",
        },
        {
            service_id: 42,
            name: "InPost Kurier",
            delivery_time: "1–2 dni robocze",
            supplier: "INPOST",
            domestic: "1",
            pickup_courier: "1",
            door_to_door: "1",
            door_to_point: "0",
            point_to_point: "0",
            point_to_door: "0",
        },
        {
            service_id: 21,
            name: "DPD Kurier",
            delivery_time: "1–3 dni robocze",
            supplier: "DPD",
            domestic: "1",
            pickup_courier: "1",
            door_to_door: "1",
            door_to_point: "0",
            point_to_point: "0",
            point_to_door: "0",
        },
        {
            service_id: 22,
            name: "DPD Pickup",
            delivery_time: "1–3 dni robocze",
            supplier: "DPD",
            domestic: "1",
            pickup_courier: "0",
            door_to_door: "0",
            door_to_point: "1",
            point_to_point: "1",
            point_to_door: "0",
        },
        {
            service_id: 11,
            name: "Pocztex Kurier 48",
            delivery_time: "do 2 dni roboczych",
            supplier: "POCZTA",
            domestic: "1",
            pickup_courier: "1",
            door_to_door: "1",
            door_to_point: "0",
            point_to_point: "0",
            point_to_door: "0",
        },
        {
            service_id: 12,
            name: "Orlen Paczka",
            delivery_time: "1–3 dni robocze",
            supplier: "ORLEN",
            domestic: "1",
            pickup_courier: "0",
            door_to_door: "0",
            door_to_point: "1",
            point_to_point: "1",
            point_to_door: "0",
        },
    ],
    options: {
        "31": { type: "bool", name: "SMS", desc: "Powiadomienie SMS" },
        "11": { type: "bool", name: "ROD", desc: "Zwrot dokumentów" },
    },
    package_type: {
        PACZKA: { type: "PACZKA", desc: "Paczka standardowa" },
    },
    points_type: ["INPOST", "UPS", "POCZTA"],
    pickup_type: {
        COURIER: { type: "COURIER", desc: "Odbiór przez kuriera" },
        SELF: { type: "SELF", desc: "Nadanie własne" },
    },
    unit_type: {
        PCS: { type: "PCS", desc: "Sztuka" },
        PKG: { type: "PKG", desc: "Opakowanie" },
    },
};

const MOCK_POINTS: Record<string, Record<string, ApaczkaPoint>> = {
    INPOST: {
        "WAW01A": {
            type: "INPOST",
            subtype: "Paczkomat",
            name: "WAW01A Paczkomat",
            address: {
                line1: "ul. Marszałkowska 1",
                postal_code: "00-001",
                city: "Warszawa",
                country_code: "PL",
                latitude: "52.2297",
                longitude: "21.0122",
            },
            open_hours: "24/7",
            option_cod: true,
            option_send: true,
            option_deliver: true,
            distance: 0.4,
            foreign_address_id: "WAW01A",
        },
        "WAW12K": {
            type: "INPOST",
            subtype: "Paczkomat",
            name: "WAW12K Paczkomat",
            address: {
                line1: "al. Jerozolimskie 100",
                postal_code: "00-807",
                city: "Warszawa",
                country_code: "PL",
            },
            open_hours: "24/7",
            option_deliver: true,
            option_send: true,
            distance: 1.2,
            foreign_address_id: "WAW12K",
        },
        "KRK01M": {
            type: "INPOST",
            subtype: "Paczkomat",
            name: "KRK01M Paczkomat",
            address: {
                line1: "ul. Floriańska 15",
                postal_code: "31-019",
                city: "Kraków",
                country_code: "PL",
            },
            open_hours: "24/7",
            option_deliver: true,
            distance: 0.8,
            foreign_address_id: "KRK01M",
        },
        "GDA05B": {
            type: "INPOST",
            subtype: "Paczkomat",
            name: "GDA05B Paczkomat",
            address: {
                line1: "ul. Długa 20",
                postal_code: "80-827",
                city: "Gdańsk",
                country_code: "PL",
            },
            open_hours: "24/7",
            option_deliver: true,
            distance: 0.5,
            foreign_address_id: "GDA05B",
        },
    },
    POCZTA: {
        "UP-WAW-1": {
            type: "POCZTA",
            subtype: "UP",
            name: "Urząd Pocztowy Warszawa 1",
            address: {
                line1: "ul. Świętokrzyska 31/33",
                postal_code: "00-049",
                city: "Warszawa",
                country_code: "PL",
            },
            open_hours: "Pn–Pt 8:00–20:00",
            option_deliver: true,
            foreign_address_id: "UP-WAW-1",
        },
    },
    UPS: {
        "UPS-WAW": {
            type: "UPS",
            subtype: "Access Point",
            name: "UPS Access Point Centrum",
            address: {
                line1: "ul. Chmielna 10",
                postal_code: "00-020",
                city: "Warszawa",
                country_code: "PL",
            },
            open_hours: "Pn–Pt 9:00–18:00",
            option_deliver: true,
            foreign_address_id: "UPS-WAW",
        },
    },
};

/** Ceny mock w groszach (jak API Apaczka) */
const MOCK_PRICES_GROSZE: Record<string, { price: number; price_gross: number }> = {
    "41": { price: 1299, price_gross: 1598 },
    "42": { price: 1499, price_gross: 1844 },
    "21": { price: 1699, price_gross: 2089 },
    "22": { price: 1399, price_gross: 1721 },
    "11": { price: 1199, price_gross: 1475 },
    "12": { price: 1099, price_gross: 1352 },
};

export function mockServiceStructure(): ApaczkaApiEnvelope<{
    services: ApaczkaServiceStructure["services"];
    options: ApaczkaServiceStructure["options"];
    package_type: ApaczkaServiceStructure["package_type"];
    points_type: ApaczkaServiceStructure["points_type"];
    pickup_type: ApaczkaServiceStructure["pickup_type"];
    unit_type: ApaczkaServiceStructure["unit_type"];
}> {
    return {
        status: 200,
        message: "",
        response: { ...MOCK_STRUCTURE },
    };
}

export function mockPoints(
    type: string,
    query?: { city?: string; postal_code?: string },
): ApaczkaApiEnvelope<{ points: Record<string, ApaczkaPoint> }> {
    const key = type.toUpperCase();
    let points = { ...(MOCK_POINTS[key] ?? MOCK_POINTS.INPOST) };

    if (query?.city) {
        const city = query.city.toLowerCase();
        points = Object.fromEntries(
            Object.entries(points).filter(([, p]) =>
                p.address.city.toLowerCase().includes(city),
            ),
        );
    }
    if (query?.postal_code) {
        const pc = query.postal_code.replace(/\s/g, "");
        points = Object.fromEntries(
            Object.entries(points).filter(([, p]) =>
                p.address.postal_code.replace(/\s/g, "").startsWith(pc.slice(0, 2)),
            ),
        );
    }

    return { status: 200, message: "", response: { points } };
}

export function mockOrderValuation(
    order: ApaczkaOrderPayload,
): ApaczkaApiEnvelope<{ price_table: Record<string, ApaczkaValuationPrice> }> {
    const sid = String(order.service_id);
    const base = MOCK_PRICES_GROSZE[sid] ?? { price: 1500, price_gross: 1845 };

    // lekki wpływ wagi na wycenę (na sucho)
    const weight = order.shipment?.[0]?.weight ?? 1;
    const bump = Math.round(Math.max(0, weight - 1) * 100);
    const price_table: Record<string, ApaczkaValuationPrice> = {
        [sid]: {
            price: base.price + bump,
            price_gross: base.price_gross + bump,
        },
    };

    return { status: 200, message: "", response: { price_table } };
}

export function mockOrderSend(
    order: ApaczkaOrderPayload,
): ApaczkaApiEnvelope<{
    order: {
        id: string;
        service_id: string | number;
        service_name: string;
        waybill_number: string;
        tracking_url: string;
        status: string;
        shipments_count: number;
        dry: true;
    };
}> {
    const sid = String(order.service_id);
    const svc = MOCK_STRUCTURE.services.find((s) => String(s.service_id) === sid);
    const id = `DRY-${Date.now()}`;
    return {
        status: 200,
        message: "Dry-run — zamówienie nie zostało wysłane do Apaczka",
        response: {
            order: {
                id,
                service_id: order.service_id,
                service_name: svc?.name ?? "Mock service",
                waybill_number: `DRYWB${id.slice(-8)}`,
                tracking_url: `https://www.apaczka.pl/sledzenie/?nr=DRYWB${id.slice(-8)}`,
                status: "NEW",
                shipments_count: order.shipment?.length ?? 1,
                dry: true,
            },
        },
    };
}

export function groszeToPln(grosze: number): number {
    return Math.round(grosze) / 100;
}

/** Minimalny PDF (bez zewnętrznych zależności) — etykieta demo. */
export function buildDryWaybillPdfBuffer(opts: {
    orderId: string;
    nrzam?: string;
    waybillNumber?: string;
}): Buffer {
    const lines = [
        `Zamowienie sklep: ${opts.nrzam ?? "-"}`,
        `Apaczka order_id: ${opts.orderId}`,
        `Numer listu: ${opts.waybillNumber ?? "-"}`,
        "Wygenerowano na zadanie - bez zapisu Blob.",
    ];
    return Buffer.from(buildSimplePdf(lines), "utf8");
}

function buildSimplePdf(lines: string[]): string {
    const escape = (s: string) =>
        s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const stream = [
        "BT /F1 14 Tf 50 780 Td (LIST PRZEWOZOWY - DEMO) Tj ET",
        ...lines.map(
            (line, i) =>
                `BT /F1 11 Tf 50 ${740 - i * 20} Td (${escape(line)}) Tj ET`,
        ),
    ].join("\n");
    const objects: string[] = [
        "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
        "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
        "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
        `4 0 obj<< /Length ${Buffer.byteLength(stream, "utf8")} >>stream\n${stream}\nendstream\nendobj`,
        "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
    ];

    let body = "%PDF-1.4\n";
    const offsets = [0];
    for (const obj of objects) {
        offsets.push(Buffer.byteLength(body, "utf8"));
        body += obj + "\n";
    }
    const xrefPos = Buffer.byteLength(body, "utf8");
    body += `xref\n0 ${objects.length + 1}\n`;
    body += "0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i++) {
        body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    body += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    body += `startxref\n${xrefPos}\n%%EOF\n`;
    return body;
}

export function mockWaybill(
    orderId: string,
    meta?: { nrzam?: string; waybillNumber?: string },
): ApaczkaApiEnvelope<{ waybill: string; type: "pdf" }> {
    const buf = buildDryWaybillPdfBuffer({
        orderId,
        nrzam: meta?.nrzam,
        waybillNumber: meta?.waybillNumber,
    });
    return {
        status: 200,
        message: "",
        response: {
            waybill: buf.toString("base64"),
            type: "pdf",
        },
    };
}
