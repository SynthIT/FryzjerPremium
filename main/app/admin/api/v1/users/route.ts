import { checkRequestAuth } from "@/lib/admin_utils";
import { collectUsers } from "@/lib/crud/users/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req, ["admin:users"]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    const promos = await collectUsers();
    return NextResponse.json({ status: 0, promos: JSON.parse(promos) });
}
