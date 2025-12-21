import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";

export async function POST(req: NextRequest) {
    const { val, mess, user } = verifyJWT(req);
    if (val && user) {
        return NextResponse.json({ status: 200, user: user }, { status: 200 });
    }
    return NextResponse.json(
        {
            status: 0,
            message: mess,
        },
        { status: 200 }
    );
}
