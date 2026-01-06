import { getDeliveryMethods } from "@/lib/crud/delivery/delivery";
import { NextResponse } from "next/server";

export async function GET() {
    const delivery = await getDeliveryMethods();
    return NextResponse.json(
        { status: 200, delivery: delivery },
        { status: 200 }
    );
}
