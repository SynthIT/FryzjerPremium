import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntentByPaymentIntentId } from "@/lib/payments/utils";
import { getOrderById, getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";

export async function GET(req: NextRequest) {
    const { protocol, host, searchParams } = new URL(req.url);
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
    const updatedOrder = await updateOrder({ ...order, status: "zrealizowane" });
    if (!updatedOrder) {
        return NextResponse.json({ error: "Order not updated" }, { status: 400 });
    }
    const response = NextResponse.json({ status: 200, message: "Order updated successfully" }, { status: 302 });
    response.headers.set("Location", `${protocol}//${host}/zamowienie/${updatedOrder.numer_zamowienia}`);
    return response;
}