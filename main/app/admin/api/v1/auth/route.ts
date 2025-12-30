import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";

export async function POST(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    console.log("no tutaj daje przeciez 200 to co sie pultasz")
    return NextResponse.json({ status: 200, message: "Autoryzacja udana" });
}
