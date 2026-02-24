import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";

export async function POST(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    return NextResponse.json({ status: 200, message: "Autoryzacja udana" });
}
