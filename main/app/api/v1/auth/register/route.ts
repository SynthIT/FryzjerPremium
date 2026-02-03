import { User } from "@/lib/models/Users";
import { Users, userSchema } from "@/lib/types/userTypes";
import { addNewUser, createJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const ok = userSchema.safeParse(reqBody);
        console.log(ok);
        if (!ok.success) {
            return NextResponse.json(
                { status: 400, error: "Błąd walidacji" },
                { status: 400 },
            );
        }
        const result = await addNewUser(ok.data as Users);
        if (result instanceof User) {
            const response = {
                status: 201,
                user: result,
            };
            const nextResponse = NextResponse.json(response, { status: 201 });
            const [token, refreshtoken] = createJWT(result, true);
            nextResponse.cookies.set("Authorization", `Bearer ${token}`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
            nextResponse.cookies.set(
                "Refresh-Token",
                `Bearer ${refreshtoken}`,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                },
            );
            return nextResponse;
        }
        return NextResponse.json(
            { status: 400, error: result },
            { status: 400 },
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { status: 500, error: "Internal server error" },
            { status: 500 },
        );
    }
}
