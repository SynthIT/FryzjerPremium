import { deleteUser } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const { mess, deleted } = await deleteUser(req);
    if (!deleted)
        return NextResponse.json(
            { status: 500, message: mess },
            { status: 500 }
        );
    const res = NextResponse.json({}, { status: 200 });
    res.cookies.set("Authorization", "", {
        path: "/",
        expires: Math.floor(Date.now() / 1000) - 10,
    });
    res.cookies.set("Refresh-Token", "", {
        path: "/",
        expires: Math.floor(Date.now() / 1000) - 10,
    });
    return res;
}
