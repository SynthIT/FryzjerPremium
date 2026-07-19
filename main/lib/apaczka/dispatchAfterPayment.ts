import { sendOrder, isApaczkaDryMode } from "./client";
import { buildShipmentsFromProducts, type ProductPackageDims } from "./shipment";
import type { ApaczkaAddressParty, ApaczkaOrderPayload } from "./types";
import type { OrderList } from "@/lib/types/orderTypes";
import type { Products } from "@/lib/types/productTypes";
import type { Users } from "@/lib/types/userTypes";

function senderFromEnv(): ApaczkaAddressParty {
    return {
        country_code: process.env.APACZKA_SENDER_COUNTRY || "PL",
        name: process.env.APACZKA_SENDER_NAME || "FryzjerPremium",
        line1: process.env.APACZKA_SENDER_LINE1 || "ul. Przykładowa 1",
        postal_code: process.env.APACZKA_SENDER_POSTAL || "00-001",
        city: process.env.APACZKA_SENDER_CITY || "Warszawa",
        contact_person: process.env.APACZKA_SENDER_CONTACT || "Biuro",
        email: process.env.APACZKA_SENDER_EMAIL || "sklep@fryzjerpremium.pl",
        phone: process.env.APACZKA_SENDER_PHONE || "500600700",
        is_residential: 0,
    };
}

function receiverFromOrder(order: OrderList): ApaczkaAddressParty {
    const d = (order.dane || {}) as Partial<Users>;
    const line1 = [d.ulica, d.nr_domu].filter(Boolean).join(" ");
    const line2 = d.nr_lokalu ? `lok. ${d.nr_lokalu}` : undefined;
    return {
        country_code: "PL",
        name: [d.imie, d.nazwisko].filter(Boolean).join(" ") || "Odbiorca",
        line1: line1 || "ul. Nieznana 1",
        line2,
        postal_code: d.kod_pocztowy || "00-001",
        city: d.miasto || "Warszawa",
        contact_person: [d.imie, d.nazwisko].filter(Boolean).join(" "),
        email: d.email,
        phone: d.telefon?.replace(/\s/g, "") || undefined,
        is_residential: 1,
        foreign_address_id: order.apaczka?.foreign_address_id,
    };
}

function packageDimsFromProduct(p: Products | null | undefined): Partial<ProductPackageDims> {
    if (!p) return {};
    return {
        szerokosc: p.szerokosc,
        wysokosc: p.wysokosc,
        dlugosc: p.dlugosc,
        waga: p.waga,
    };
}

/**
 * Po płatności: wysyła zamówienie produktów do Apaczka i zwraca pola do zapisu na order.apaczka.
 * Kursy-only / brak apaczka → null (bez wysyłki).
 */
export async function dispatchApaczkaAfterPayment(order: OrderList): Promise<{
    order_id: string;
    waybill_number: string;
    tracking_url: string;
    dry: boolean;
} | null> {
    if (!order.apaczka) return null;
    if (!order.produkty?.length) return null;

    const shipments = buildShipmentsFromProducts(
        order.produkty.map((line) => ({
            dims: packageDimsFromProduct(line.pozycja as Products),
            quantity: line.ilosc,
        })),
    );

    const payload: ApaczkaOrderPayload = {
        service_id: order.apaczka.service_id,
        address: {
            sender: senderFromEnv(),
            receiver: receiverFromOrder(order),
        },
        shipment: shipments,
        shipment_value: Math.round(Number(order.suma || 0) * 100),
        shipment_currency: "PLN",
        content: `Zamówienie ${order.numer_zamowienia}`,
        comment: order.numer_zamowienia,
    };

    const result = await sendOrder(payload);
    if (result.status !== 200) {
        console.error("Apaczka order_send failed:", result.message, order.numer_zamowienia);
        return null;
    }

    const id = result.response?.order?.id;
    if (!id) {
        console.error("Apaczka order_send: brak order.id", result);
        return null;
    }

    return {
        order_id: String(id),
        waybill_number: String(result.response.order.waybill_number || ""),
        tracking_url: String(result.response.order.tracking_url || ""),
        dry: Boolean(result.response.order.dry ?? isApaczkaDryMode()),
    };
}
