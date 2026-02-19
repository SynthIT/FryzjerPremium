import { checkRequestAuth } from "@/lib/admin_utils";
import { collectUsers } from "@/lib/crud/users/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Dla GET requestów sprawdzamy tylko, czy użytkownik jest zalogowany
    const { val } = checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 },
        );
    }
    const uzytkownik = await collectUsers();
    return NextResponse.json({ status: 0, users: JSON.stringify(uzytkownik) });
}
