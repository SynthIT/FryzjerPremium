import { checkRequestAuth } from "@/lib/admin_utils";
import { collectUsers } from "@/lib/crud/users/users";
import { addNewUser } from "@/lib/admin_utils";
import { Users, userSchema } from "@/lib/types/userTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Dla GET requestów sprawdzamy tylko, czy użytkownik jest zalogowany
    const { val } = await checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 },
        );
    }
    const uzytkownik = await collectUsers();
    return NextResponse.json({ status: 0, users: JSON.stringify(uzytkownik) });
}

export async function POST(req: NextRequest) {
    const { val } = await checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 },
        );
    }
    try {
        const reqBody = await req.json();
        const ok = userSchema.safeParse(reqBody);
        if (!ok.success) {
            return NextResponse.json(
                { status: 400, error: "Błąd walidacji", details: ok.error.flatten() },
                { status: 400 },
            );
        }
        const result = await addNewUser(ok.data as Users);
        if (result && typeof result === "object" && "_id" in result) {
            return NextResponse.json(
                { status: 201, user: result },
                { status: 201 },
            );
        }
        return NextResponse.json(
            { status: 400, error: typeof result === "string" ? result : "Nie udało się dodać użytkownika" },
            { status: 400 },
        );
    } catch (error) {
        console.error("Admin create user error:", error);
        return NextResponse.json(
            { status: 500, error: "Błąd serwera" },
            { status: 500 },
        );
    }
}
