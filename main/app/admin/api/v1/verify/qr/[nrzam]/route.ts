import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ nrzam: string }> }) {
    const { nrzam } = await params;
    const { protocol, host } = new URL(req.url);
    const order = await getOrderByNumerZamowienia(nrzam);
    if (!order) {
        const res = NextResponse.json({ status: 404, message: "Order not found" }, { status: 404 });
        res.headers.set("Location", `${protocol}//${host}/admin/orders?notfound=true&nrzam=${nrzam}`);
        return res;
    }
    const res = NextResponse.json({ status: 200, message: "Order found" }, { status: 200 });
    res.headers.set("Location", `${protocol}//${host}/admin/orders/${order.numer_zamowienia}`);
    return res;
}