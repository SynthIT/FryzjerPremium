import { NextRequest, NextResponse } from "next/server";
import { getOrderValuation, isApaczkaDryMode } from "@/lib/apaczka/client";
import { groszeToPln } from "@/lib/apaczka/mock";
import {
    buildShipmentsFromProducts,
    type ProductPackageDims,
} from "@/lib/apaczka/shipment";
import type { ApaczkaOrderPayload } from "@/lib/apaczka/types";
import { Product } from "@/lib/models/Products";
import { db } from "@/lib/db/init";
import type { Products } from "@/lib/types/productTypes";

type CartLineInput = { product_id?: string; slug?: string; quantity: number };

/**
 * POST — wycena (order_valuation).
 * Preferowane: { service_id, items: [{ slug|product_id, quantity }], city, postal_code, shipment_value }
 * Wymiary biorą się z produktów w DB (nie hardcode).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        let shipment = body.shipment;
        if (!shipment && Array.isArray(body.items) && body.items.length > 0) {
            await db();
            const lines = body.items as CartLineInput[];
            const ids = lines.map((l) => l.product_id).filter(Boolean) as string[];
            const slugs = lines.map((l) => l.slug).filter(Boolean) as string[];
            const products = (await Product.find(
                ids.length && slugs.length
                    ? { $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }] }
                    : ids.length
                      ? { _id: { $in: ids } }
                      : { slug: { $in: slugs } },
            ).lean()) as Products[];
            const byId = new Map(products.map((p) => [String(p._id), p]));
            const bySlug = new Map(products.map((p) => [p.slug, p]));
            shipment = buildShipmentsFromProducts(
                lines.map((l) => {
                    const p =
                        (l.product_id && byId.get(String(l.product_id))) ||
                        (l.slug && bySlug.get(l.slug)) ||
                        undefined;
                    const dims: Partial<ProductPackageDims> = p
                        ? {
                              szerokosc: p.szerokosc,
                              wysokosc: p.wysokosc,
                              dlugosc: p.dlugosc,
                              waga: p.waga,
                          }
                        : {};
                    return { dims, quantity: l.quantity };
                }),
            );
        }

        const order: ApaczkaOrderPayload =
            body.order ??
            ({
                service_id: body.service_id,
                address: {
                    receiver: body.receiver ?? {
                        country_code: "PL",
                        name: "Odbiorca",
                        line1: body.line1 || "ul. Przykładowa 1",
                        postal_code: body.postal_code || "00-001",
                        city: body.city || "Warszawa",
                        foreign_address_id: body.foreign_address_id,
                    },
                },
                shipment:
                    shipment ??
                    buildShipmentsFromProducts([
                        {
                            dims: {
                                szerokosc: 20,
                                wysokosc: 10,
                                dlugosc: 30,
                                waga: body.weight ?? 1,
                            },
                            quantity: 1,
                        },
                    ]),
                shipment_value: body.shipment_value ?? 0,
                shipment_currency: "PLN",
            } satisfies ApaczkaOrderPayload);

        if (order.service_id == null) {
            return NextResponse.json(
                { status: 1, error: "Brak service_id" },
                { status: 400 },
            );
        }

        const result = await getOrderValuation(order);
        if (result.status !== 200) {
            return NextResponse.json(
                { status: 1, error: result.message || "Błąd wyceny" },
                { status: 400 },
            );
        }

        const sid = String(order.service_id);
        const row = result.response.price_table?.[sid];
        const priceGrossGrosze = row?.price_gross ?? 0;

        return NextResponse.json({
            status: 0,
            dry: isApaczkaDryMode(),
            price_table: result.response.price_table,
            price_gross_pln: groszeToPln(priceGrossGrosze),
            price_net_pln: groszeToPln(row?.price ?? 0),
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { status: 1, error: "Nie udało się wycenić dostawy" },
            { status: 500 },
        );
    }
}
