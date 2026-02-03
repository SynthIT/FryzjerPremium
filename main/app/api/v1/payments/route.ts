import { CartItem } from "@/contexts/CartContext";
import { verifyJWT } from "@/lib/admin_utils";
import { createPaymentIntent } from "@/lib/payments/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const cart: CartItem[] = await req.json();
        let price = 0;
        for (const item of cart) {
            price += item.price * item.quantity;
        }
        console.log(price);
        if (req.cookies.get("Authorization") === undefined) {
            const payment = await createPaymentIntent(price * 100, "pln");
            return new NextResponse(
                JSON.stringify({ client_secret: payment.client_secret }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        } else {
            const { val, user } = verifyJWT(req);
            if (!val || user === undefined) {
                const payment = await createPaymentIntent(price, "pln");
                return new NextResponse(
                    JSON.stringify({ client_secret: payment.client_secret }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            } else {
                const payment = await createPaymentIntent(
                    price,
                    "pln",
                    user.stripe_id,
                );
                return new NextResponse(
                    JSON.stringify({ client_secret: payment.client_secret }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
        }
    } catch (error) {
        console.error("Error confirming Payment Intent:", error);
        return new NextResponse(
            JSON.stringify({ error: "Could not confirm Payment Intent" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
}
