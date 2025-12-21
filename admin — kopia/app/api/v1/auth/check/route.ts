import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";

export async function POST(req: NextRequest) {
    const ok = verifyJWT(req);
    if (ok.val && ok.user) {
        return NextResponse.json(
            { status: 200, user: ok.user },
            { status: 200 }
        );
    }
    return NextResponse.json(
        {
            status: 0,
        },
        { status: 200 }
    );
}
