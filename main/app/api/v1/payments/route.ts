import { cartOrderSuma, validateCartItems } from "@/lib/cart/validateCartItems";
import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { zodCart } from "@/lib/types/cartTypes";
import { verifyJWT } from "@/lib/admin_utils";
import {
    createPaymentIntent,
    getPaymentIntent,
    updatePaymentIntent,
} from "@/lib/payments/utils";
import { NextRequest, NextResponse } from "next/server";

function jsonOk(
    payload: { client_secret: string | null; changedEntries?: unknown },
    status = 200,
) {
    return NextResponse.json(payload, { status });
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { koszyk?: unknown; produkty?: unknown };
        const koszykId = typeof body.koszyk === "string" ? body.koszyk : "";
        if (!koszykId) {
            return NextResponse.json({ error: "Brak koszyka" }, { status: 400 });
        }

        let price = 0;
        let changedEntries: unknown[] = [];

        // Preferuj sumę z zamówienia w DB (już z dostawą / zwalidowanymi cenami).
        const order = await getOrderByNumerZamowienia(koszykId);
        if (
            order &&
            order.status === "w_koszyku" &&
            typeof order.suma === "number" &&
            order.suma > 0
        ) {
            price = Math.round(order.suma * 100);
        } else {
            const cartParse = zodCart.safeParse({
                id: koszykId,
                items: body.produkty,
            });
            if (!cartParse.success) {
                return NextResponse.json(
                    { error: "Błędny koszyk", details: cartParse.error.message },
                    { status: 400 },
                );
            }
            const validated = await validateCartItems(cartParse.data);
            changedEntries = validated.changedEntries;
            const totalAmount = cartOrderSuma(validated.updatedCart);
            price = Math.round(totalAmount * 100);
        }

        if (!Number.isFinite(price) || price <= 0) {
            return NextResponse.json(
                { error: "Nieprawidłowa kwota płatności" },
                { status: 400 },
            );
        }

        const { val, user } = await verifyJWT(req);
        const customerId =
            val && user?.stripe_id ? user.stripe_id : undefined;

        const existingPayment = await getPaymentIntent(koszykId);
        if (existingPayment) {
            if (existingPayment.amount !== price) {
                try {
                    const updatedPayment = await updatePaymentIntent(
                        existingPayment,
                        price,
                        customerId,
                    );
                    return jsonOk({
                        client_secret: updatedPayment.client_secret,
                        changedEntries,
                    });
                } catch {
                    // Intent nieedytowalny — utwórz nowy poniżej.
                }
            } else {
                return jsonOk({
                    client_secret: existingPayment.client_secret,
                    changedEntries,
                });
            }
        }

        const payment = await createPaymentIntent(
            price,
            "pln",
            koszykId,
            customerId,
        );
        return jsonOk(
            {
                client_secret: payment.client_secret,
                changedEntries,
            },
            201,
        );
    } catch (error) {
        console.error("Error creating/updating Payment Intent:", error);
        return NextResponse.json(
            { error: "Nie udało się utworzyć płatności" },
            { status: 500 },
        );
    }
}
