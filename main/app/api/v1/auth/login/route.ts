import { User } from "@/lib/models/Users";
import { checkExistingUser, createJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const reqBody = await req.json();
    console.log(reqBody);
    try {
        const result = await checkExistingUser(reqBody.email, reqBody.password);
        console.log(result);
        if (result instanceof User && typeof result != "string") {
            const response = {
                status: 201,
                user: result,
            };
            const nextResponse = NextResponse.json(response, { status: 201 });
            const [token, refresh] = createJWT(result, reqBody.refreshToken);
            nextResponse.cookies.set("Authorization", `Bearer ${token}`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
            if (reqBody.refreshToken) {
                nextResponse.cookies.set("Refresh-Token", `Bearer ${refresh}`, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
            }
            return nextResponse;
        }
        return NextResponse.json({ status: 400, error: result });
    } catch (err) {
        return NextResponse.json({ status: 400, error: err }, { status: 400 });
    }
}
