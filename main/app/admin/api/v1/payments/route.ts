import { getPaymentIntent } from "@/lib/payments/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams;
    const nrzam = query.get("nrzam");
    if (!nrzam) {
        return NextResponse.json({ status: 1, error: "Bad request" }, { status: 400 });
    }
    const paymentIntent = await getPaymentIntent(nrzam as string);
    if (!paymentIntent) {
        return NextResponse.json({ status: 1, error: "Payment intent not found" }, { status: 404 });
    }
    return NextResponse.json({ status: 0, paymentIntent: paymentIntent });
}