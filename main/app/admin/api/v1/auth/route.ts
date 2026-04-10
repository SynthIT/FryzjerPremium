import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";

export async function POST(req: NextRequest) {
    const param = req.url.split("?")[1];
    const params = new URLSearchParams(param);
    const scope = params.get("scope");
    if (!scope) {
        return NextResponse.json(
            { status: 1, error: "Nieprawidłowo zbudowany link" },
            { status: 401 }
        );
    }
    switch (scope) {
        case "required_admin":
            const { val, mess } = await checkRequestAuth(req, "admin:any");
            if (!val) {
                return NextResponse.json(
                    { status: 1, error: "Brak autoryzacji" },
                    { status: 401 }
                );
            }
            return NextResponse.json({ status: 0, message: "Autoryzacja udana" });
        default:
            return NextResponse.json(
                { status: 1, error: "Nieoczekiwana struktura linku" },
                { status: 401 }
            );
    }
}
