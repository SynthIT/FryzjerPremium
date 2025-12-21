import { changePassword } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";
import { resourceLimits } from "node:worker_threads";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { mess, user, jwt } = await changePassword(
        req,
        body.newPassword,
        body.oldPassword
    );
    if (!user)
        return NextResponse.json(
            { status: 400, message: mess },
            { status: 200 }
        );
    const res = NextResponse.json(
        { status: 201, message: mess },
        { status: 201 }
    );
    res.cookies.set("Authorization", `Bearer ${jwt}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    return res;
}
