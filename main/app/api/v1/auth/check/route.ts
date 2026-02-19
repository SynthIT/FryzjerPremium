import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";
import { Orders } from "@/lib/models/Users";

export async function POST(req: NextRequest) {
    const { val, mess, user } = verifyJWT(req);
    if (val && user) {
        const orders = await Orders.find({ user: user._id });
        return NextResponse.json({ status: 0, user: user, orders: orders }, { status: 200 });
    }
    return NextResponse.json({ status: 1, message: mess }, { status: 400 });
}
