import { UsersReponse } from "@/lib/interfaces/ax";
import { User } from "@/lib/models/Users";
import { addNewUser, createJWT } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const reqBody: { email: string; password: string } = await req.json();
    console.log("Rejestracja użytkownika:", reqBody);
    const result = await addNewUser(reqBody.email, reqBody.password);
    if (result instanceof User) {
        const response: UsersReponse = {
            status: 201,
            user: result,
        };
        const nextResponse = NextResponse.json(response, { status: 201 });
        const token = createJWT(reqBody.email);
        nextResponse.cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        return nextResponse;
    }
    return NextResponse.json({ status: 400, error: result }, { status: 400 });
}
