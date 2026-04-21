import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntentByPaymentIntentId } from "@/lib/payments/utils";
import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";



export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const payment_intent = searchParams.get("payment_intent");
    if (!payment_intent) {
        return NextResponse.json({ error: "Payment intent not found" }, { status: 400 });
    }
    const payment = await getPaymentIntentByPaymentIntentId(payment_intent);
    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 400 });
    }
    const { koszyk_id } = payment.metadata;
    if (!koszyk_id) {
        return NextResponse.json({ error: "Koszyk ID not found" }, { status: 400 });
    }
    const order = await getOrderByNumerZamowienia(koszyk_id);
    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }
    if (order.status === "w_realizacji") {
        return NextResponse.json({ done: true, nrzam: order.numer_zamowienia }, { status: 200 });
    }
    if (order.status === "nieudana") {
        return NextResponse.json({ done: false, failed: true }, { status: 402 });
    }
    return NextResponse.json({ done: false }, { status: 200 });
}