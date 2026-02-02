import { Categories } from "@/lib/types/shared";
import path from "path";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const file = readFileSync(
        path.join(process.cwd(), "data", "kategorie.json"),
        "utf8",
    );
    const categories: Record<string, string[]> = JSON.parse(file);
    const response = {
        status: 0,
        categories: categories,
    };
    return NextResponse.json(response);
}
