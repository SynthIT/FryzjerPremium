import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

interface EmailVerification {
    salt: string;
    code: number;
}
export const maxDuration = 15; //minutes
export const emailsToVerify: Record<string, EmailVerification> = {};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const code = Math.floor(100000 + Math.random() * 900000);
    return NextResponse.json({ code: code }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const salt = randomBytes(16).toString("hex");
    const code = Math.floor(100000 + Math.random() * 900000);
    const body = await req.json();
    emailsToVerify[body.email] = { salt, code };
}