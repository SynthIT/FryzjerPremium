import { checkRequestAuth } from "@/lib/admin_utils";
import { collectOrders, updateOrder } from "@/lib/crud/orders/orders";
import { OrderList } from "@/lib/types/userTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const orders = await collectOrders();
    const query = request.nextUrl.searchParams;
    const nrzam = query.get("nrzam");
    if (nrzam) {
        const order = JSON.parse(orders).find((order: OrderList) => order.numer_zamowienia === nrzam);
        if (!order) {
            return NextResponse.json({ status: 1, error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json({ status: 0, order: order });
    }
    return NextResponse.json({ status: 0, orders: orders });
}

export async function PUT(request: NextRequest) {
    const { val, mess } = await checkRequestAuth(request, ["admin:orders", "admin:users"]);
    if (!val) {
        return NextResponse.json({ status: 1, error: "Brak autoryzacji", details: mess }, { status: 401 });
    }
    const { order, status, reason } = await request.json();
    const updatedOrder = await updateOrder({ ...order, status, reason });
    if (!updatedOrder) {
        return NextResponse.json({ status: 1, error: "Błąd podczas aktualizacji zamówienia" }, { status: 500 });
    }
    return NextResponse.json({ status: 0, order: updatedOrder, message: "Zamówienie zaktualizowane" });
}