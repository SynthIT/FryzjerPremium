import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";
import { Role } from "@/lib/models/Users";

export async function POST(req: NextRequest) {
    const { val, mess, user } = verifyJWT(req);
    if (val && user) {
        if ((user.role as Role[]).length > 0) {
            return NextResponse.json({ status: 200 }, { status: 200 });
        }
        return NextResponse.json({ status: 400 }, { status: 400 });
    }
    return NextResponse.json({ status: 400, message: mess }, { status: 400 });
}
