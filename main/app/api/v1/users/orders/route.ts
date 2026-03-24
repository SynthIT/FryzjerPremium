import { verifyJWT } from "@/lib/admin_utils";
import { getUserOrders } from "@/lib/crud/users/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { val, user } = await verifyJWT(req);
    if (!val || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await getUserOrders(user.email);
    return NextResponse.json({ status: 200, orders: orders }, { status: 200 });
}