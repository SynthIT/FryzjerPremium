import { verifyJWT } from "@/lib/admin_utils";
import {
    getAccountVerifyByEmail,
    submitAccountVerify,
} from "@/lib/crud/accountVerify/accountVerify";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { val, user, mess } = await verifyJWT(req);
    if (!val || !user) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    const doc = await getAccountVerifyByEmail(user.email);
    return NextResponse.json({ status: 0, request: doc ?? null }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const { val, user, mess } = await verifyJWT(req);
    if (!val || !user) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    try {
        const body = await req.json();
        const result = await submitAccountVerify(
            user.email,
            user._id?.toString?.() ?? String(user._id ?? ""),
            body,
        );
        if (!result.ok) {
            return NextResponse.json(
                { status: 1, error: result.error },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { status: 0, message: "Wniosek został złożony.", request: result.doc },
            { status: 201 },
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { status: 1, error: "Nie udało się złożyć wniosku." },
            { status: 500 },
        );
    }
}
