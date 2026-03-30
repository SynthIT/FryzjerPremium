import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ nrzam: string }> }) {
    const { nrzam } = await params;
    const order = await getOrderByNumerZamowienia(nrzam);
    if (!order) {
        return NextResponse.json({ status: 1, error: "Zamówienie nie znalezione" }, { status: 404 });
    }
    return NextResponse.json({ status: 0, order: order }, { status: 200 });
}   