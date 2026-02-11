import { editUser, verifyJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { mess, user, jwt } = await editUser(req, body.user);
    console.log(mess);
    if (!user)
        return NextResponse.json(
            { status: 400, message: mess },
            { status: 400 },
        );
    const res = NextResponse.json(
        { status: 201, message: mess, user: user },
        { status: 201 },
    );
    res.cookies.set("Authorization", `Bearer ${jwt![0]}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    if (jwt![1]) {
        res.cookies.set("Refresh-Token", `Bearer ${jwt![1]}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }
    return res;
}

export function GET(req: NextRequest) {
    const { val, mess, user } = verifyJWT(req);
    if (val) {
        return NextResponse.json({ status: 0, user: user }, { status: 200 });
    }
    return NextResponse.json({}, { status: 204 });
}
