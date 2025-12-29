import { NextRequest, NextResponse } from "next/server";

export function POST(req: NextRequest) {
    const res = NextResponse.json({}, { status: 200 });
    res.cookies.set("Authorization", "", {
        expires: Math.floor(Date.now() / 1000) - 10,
    });
    res.cookies.set("Refresh-Token", "", {
        expires: Math.floor(Date.now() / 1000) - 10,
    });
    return res;
}
