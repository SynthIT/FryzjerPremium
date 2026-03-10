import { collectOrders } from "@/lib/crud/orders/orders";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const orders = await collectOrders();
    return NextResponse.json({ status: 0, orders: orders });
}