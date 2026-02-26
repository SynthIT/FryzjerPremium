import { createJWT, editUser, verifyJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { mess, user } = await editUser(req, body.user);
    console.log(mess);
    if (!user)
        return NextResponse.json(
            { status: 400, message: mess },
            { status: 400 },
        );
    const [token, refreshToken] = createJWT(user);
    const res = NextResponse.json(
        { status: 201, message: mess, user: user },
        { status: 201 },
    );
    res.cookies.set("Authorization", `Bearer ${token}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    if (refreshToken) {
        res.cookies.set("Refresh-Token", `Bearer ${refreshToken}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }
    return res;
}
