import { collectOrders } from "@/lib/crud/orders/orders";
import { OrderList } from "@/lib/types/userTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const orders = await collectOrders();
    const query = request.nextUrl.searchParams;
    const nrzam = query.get("nrzam");
    if (nrzam) {
        const order = JSON.parse(orders).find((order: OrderList) => order.numer_zamowienia === nrzam);
        return NextResponse.json({ status: 0, order: order });
    }
    return NextResponse.json({ status: 0, orders: orders });
}