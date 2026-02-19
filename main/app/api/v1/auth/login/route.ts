import { checkExistingUser, createJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const reqBody = await req.json();
    console.log(reqBody);
    try {
        const { error, user, orders } = await checkExistingUser(reqBody.email, reqBody.password);
        if (error) {
            return NextResponse.json({ status: 400, error: error }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ status: 400, error: "Użytkownik nie istnieje" }, { status: 400 });
        }
        if (!orders) {
            return NextResponse.json({ status: 400, error: "Użytkownik nie ma zamówień" }, { status: 400 });
        }
        const nextResponse = NextResponse.json({ status: 201, user: user, orders: orders }, { status: 201 });
        const [token, refresh] = createJWT(user, reqBody.refreshToken);
        nextResponse.cookies.set("Authorization", `Bearer ${token}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        if (reqBody.refreshToken) {
            nextResponse.cookies.set("Refresh-Token", `Bearer ${refresh}`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
        }
        return nextResponse;

    } catch (err) {
        return NextResponse.json({ status: 400, error: err }, { status: 400 });
    }
}
