import { CartItem } from "@/lib/types/cartTypes";
import { verifyJWT } from "@/lib/admin_utils";
import {
    createPaymentIntent,
    getPaymentIntent,
    updatePaymentIntent,
} from "@/lib/payments/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body: { koszyk: string; produkty: CartItem[] } = await req.json();
        const { koszyk, produkty } = body;
        const totalAmount = produkty.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const price = Math.round(totalAmount * 100);
        if (req.cookies.get("Authorization") === undefined) {
            const existingPayment = await getPaymentIntent(koszyk);
            if (existingPayment) {
                if (price > existingPayment.amount) {
                    const updatedPayment = await updatePaymentIntent(
                        existingPayment,
                        price,
                    );
                    return new NextResponse(
                        JSON.stringify({
                            client_secret: updatedPayment.client_secret,
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
                return new NextResponse(
                    JSON.stringify({
                        client_secret: existingPayment.client_secret,
                    }),
                    {
                        status: 201,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            const payment = await createPaymentIntent(price, "pln", koszyk);
            return new NextResponse(
                JSON.stringify({ client_secret: payment.client_secret }),
                {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                },
            );
        } else {
            const { val, user } = verifyJWT(req);
            if (!val || user === undefined) {
                const existingPayment = await getPaymentIntent(koszyk);
                if (existingPayment) {
                    if (price > existingPayment.amount) {
                        const updatedPayment = await updatePaymentIntent(
                            existingPayment,
                            price,
                        );
                        return new NextResponse(
                            JSON.stringify({
                                client_secret: updatedPayment.client_secret,
                            }),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        );
                    }
                    return new NextResponse(
                        JSON.stringify({
                            client_secret: existingPayment.client_secret,
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }

                const payment = await createPaymentIntent(price, "pln", koszyk);
                return new NextResponse(
                    JSON.stringify({ client_secret: payment.client_secret }),
                    {
                        status: 201,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            } else {
                const existingPayment = await getPaymentIntent(koszyk);
                if (existingPayment) {
                    if (price > existingPayment.amount) {
                        const updatedPayment = await updatePaymentIntent(
                            existingPayment,
                            price,
                        );
                        return new NextResponse(
                            JSON.stringify({
                                client_secret: updatedPayment.client_secret,
                            }),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        );
                    }
                    return new NextResponse(
                        JSON.stringify({
                            client_secret: existingPayment.client_secret,
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }

                const payment = await createPaymentIntent(
                    price,
                    "pln",
                    koszyk,
                    user.stripe_id!,
                );
                return new NextResponse(
                    JSON.stringify({ client_secret: payment.client_secret }),
                    {
                        status: 201,
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
