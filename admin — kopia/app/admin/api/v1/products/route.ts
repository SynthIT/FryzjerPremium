import { collectProducts } from "@/lib/admin_utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    const products = await collectProducts();
    return NextResponse.json(JSON.parse(products));
}
