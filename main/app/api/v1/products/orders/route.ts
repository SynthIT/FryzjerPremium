import { verifyJWT } from "@/lib/admin_utils";
import { createOrder } from "@/lib/crud/orders/orders";
import { orderListSchema } from "@/lib/types/orderTypes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { order?: unknown };
        const parsed = orderListSchema.safeParse(body.order);
        if (!parsed.success) {
            return NextResponse.json(
                { status: 1, error: "Błędne dane zamówienia", details: parsed.error.message },
                { status: 400 },
            );
        }

        const { val, user } = await verifyJWT(req);
        const order = parsed.data;

        // Jeśli użytkownik jest zalogowany, nie pozwalamy podszyć się pod innego użytkownika/email.
        if (val && user) {
            if (order.user && typeof order.user === "string" && order.user !== user._id?.toString()) {
                return NextResponse.json(
                    { status: 1, error: "Nieprawidłowy użytkownik zamówienia" },
                    { status: 403 },
                );
            }
            if (order.email && order.email !== user.email) {
                return NextResponse.json(
                    { status: 1, error: "Nieprawidłowy email zamówienia" },
                    { status: 403 },
                );
            }
        }

        const created = await createOrder(order);
        if ((created as { error?: string } | null)?.error) {
            return NextResponse.json(
                { status: 1, error: (created as { error: string }).error },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { status: 201, order: created },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { status: 1, error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

