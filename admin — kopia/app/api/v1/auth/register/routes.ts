import { UsersReponse } from "@/lib/interfaces/ax";
import { User } from "@/lib/models/Users";
import { addNewUser } from "@/lib/utils_admin";
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
        return NextResponse.json(response).cookies;
    } else {
        return NextResponse.json({
            status: 400,
            message: result,
        });
    }
}
