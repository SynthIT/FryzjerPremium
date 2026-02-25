import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";

export async function GET(request: NextRequest) {
    const { val, user } = await verifyJWT(request);
    if (!val || !user) {
        return NextResponse.json({ loggedIn: false });
    }
    return NextResponse.json({
        loggedIn: true,
        user: { _id: user._id, email: user.email },
    });
}
