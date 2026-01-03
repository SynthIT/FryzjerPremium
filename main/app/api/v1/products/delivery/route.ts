import { getDeliveryMethods } from "@/lib/crud/delivery/delivery";
import { NextResponse } from "next/server";

export function GET() {
    const delivery = getDeliveryMethods();
    return NextResponse.json(
        { status: 200, delivery: delivery },
        { status: 200 }
    );
}
