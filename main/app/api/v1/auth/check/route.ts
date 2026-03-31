import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";
import { Orders } from "@/lib/models/Users";

export async function POST(req: NextRequest) {
    const { val, mess, user, jwt } = await verifyJWT(req);
    const red_user = { ...user, haslo: undefined };
    if (val && user) {
        const orders = await Orders.find({ user: user._id });
        const resposne = NextResponse.json({ status: 0, user: red_user, orders: orders ?? [] }, { status: 200 });
        if (jwt) {
            resposne.cookies.set("Authorization", `Bearer ${jwt![0]}`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
        }
        return resposne;
    }
    return NextResponse.json({ status: 1, message: mess }, { status: 400 });
}
