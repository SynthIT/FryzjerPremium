import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/admin_utils";
import { Role } from "@/lib/models/Users";

export async function POST(req: NextRequest) {
    const { val, mess, user } = verifyJWT(req);
    if (val && user) {
        if ((user.role as Role[]).length > 0) {
            return NextResponse.json({ status: 200 }, { status: 200 });
        }
        const res = NextResponse.json(
            { status: 400, error: mess },
            { status: 400 }
        );
        res.cookies.set("Authorization", "", {
            expires: Date.now() / 1000 - 20,
        });
        res.cookies.set("Refresh-Token", "", {
            expires: Date.now() / 1000 - 20,
        });
        return res;
    }
    const res = NextResponse.json(
        { status: 400, error: mess },
        { status: 400 }
    );
    res.cookies.set("Authorization", "", { expires: Date.now() / 1000 - 20 });
    res.cookies.set("Refresh-Token", "", { expires: Date.now() / 1000 - 20 });
    return res;
}
