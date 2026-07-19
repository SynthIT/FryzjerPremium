import { collectProducts } from "@/lib/crud/products/product";
import { Products } from "@/lib/types/productTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const limitRaw = req.nextUrl.searchParams.get("limit");
    const limit = Math.min(
        50,
        Math.max(1, Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : 12),
    );

    const products: Products[] = JSON.parse(await collectProducts());
    const sorted = products
        .slice()
        .sort((a, b) => {
            const ta = new Date((a.createdAt as string | undefined) ?? 0).getTime();
            const tb = new Date((b.createdAt as string | undefined) ?? 0).getTime();
            return tb - ta;
        })
        .slice(0, limit);

    return NextResponse.json({ status: 200, products: sorted });
}