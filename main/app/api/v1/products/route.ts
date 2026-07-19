import { Products, zodProducts } from "@/lib/types/productTypes";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth, returnAvailableWariant } from "@/lib/admin_utils";
import { collectProducts } from "@/lib/crud/products/product";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get("slug");
    if (slug) {
        const products: Products[] = JSON.parse(await collectProducts());
        const productf: Products | undefined = products.find((p) => p.slug === slug);
        if (!productf) {
            return NextResponse.json(
                { status: 1, error: "Produkt nie znaleziony" },
                { status: 404 },
            );
        }
        const { product } = await returnAvailableWariant(req, productf);
        const response = {
            status: 0,
            product: product,
        };
        return NextResponse.json(response);
    }
    const products: Products[] = JSON.parse(await collectProducts());
    const response = {
        status: 200,
        products: products,
    };
    return NextResponse.json(response);
}

export async function PUT(req: NextRequest) {
    try {
        const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
        if (!val) {
            return NextResponse.json(
                { status: 1, error: "Brak autoryzacji", details: mess },
                { status: 401 },
            );
        }
        const product = await req.json();
        const ok = zodProducts.safeParse(product);
        if (!ok.success) {
            return NextResponse.json(
                { status: 1, error: "Błędne dane produktu", details: ok.error.message },
                { status: 400 },
            );
        }
        const productData = ok.data;
        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);
        const index = products.findIndex((p) => p.slug === productData.slug);
        if (index === -1) {
            return NextResponse.json(
                { status: 1, error: "Produkt nie znaleziony" },
                { status: 404 },
            );
        }
        products[index] = productData;
        writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
        return NextResponse.json({ status: 0, product: productData });
    } catch (error) {
        console.error("Błąd podczas aktualizacji produktu:", error);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 },
        );
    }
}

