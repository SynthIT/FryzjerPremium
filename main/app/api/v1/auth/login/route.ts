import { checkExistingUser, createJWT } from "@/lib/admin_utils";
import { zodLogin } from "@/lib/types/userTypes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const ok = zodLogin.safeParse(reqBody);
        if (!ok.success) {
            return NextResponse.json({ status: 400, error: "Błędne dane" }, { status: 400 });
        }
        const formUser = ok.data;
        const { error, user, orders } = await checkExistingUser(formUser.email, formUser.password);
        if (error) {
            return NextResponse.json({ status: 400, error: error }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ status: 400, error: "Użytkownik nie istnieje" }, { status: 400 });
        }
        const nextResponse = NextResponse.json({ status: 201, user: user, orders: orders ?? [] }, { status: 201 });
        const [token, refresh] = createJWT(user, formUser.refreshToken);
        nextResponse.cookies.set("Authorization", `Bearer ${token}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        if (reqBody.refreshToken) {
            nextResponse.cookies.set("Refresh-Token", `Bearer ${refresh}`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
        }
        return nextResponse;

    } catch (err) {
        return NextResponse.json({ status: 400, error: err }, { status: 400 });
    }
}
