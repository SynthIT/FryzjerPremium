import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/models/Users";
import { db } from "@/lib/db/init";

export async function POST(req: NextRequest) {
    try {
        await db();
        const { email } = await req.json();
        const user = await User.findOne({ email: email });
        return NextResponse.json({ user: user ? user : false });
    } catch (error) {
        console.error("Error finding user:", error);
        return NextResponse.json({ user: false, error: "Błąd podczas wyszukiwania użytkownika" }, { status: 500 });
    }
}