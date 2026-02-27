import { Products, zodProducts } from "@/lib/types/productTypes";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth, returnAvailableWariant } from "@/lib/admin_utils";
import { collectProducts } from "@/lib/crud/products/product";

export async function GET(req: NextRequest) {
    const url = req.url.split("/");
    const querystring =
        url[url.length - 1] != "get"
            ? url[url.length - 1].split("?")[1]
            : false;

    // const file = readFileSync(
    //     path.join(process.cwd(), "data", "produkty.json"),
    //     "utf8",
    // );
    if (querystring) {
        const products: Products[] = JSON.parse(await collectProducts());
        const productf: Products | undefined = products.find((p) => {
            return p.slug == querystring.split("=")[1];
        });
        const { product } = await returnAvailableWariant(req, productf!);
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

export async function DELETE(req: NextRequest) {
    try {
        const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
        if (!val) {
            return NextResponse.json(
                { status: 1, error: "Brak autoryzacji", details: mess },
                { status: 401 },
            );
        }
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json(
                { status: 1, error: "Brak slug produktu" },
                { status: 400 },
            );
        }

        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);

        const filteredProducts = products.filter((p) => p.slug !== slug);
        if (filteredProducts.length === products.length) {
            return NextResponse.json(
                { status: 1, error: "Produkt nie znaleziony" },
                { status: 404 },
            );
        }

        writeFileSync(
            filePath,
            JSON.stringify(filteredProducts, null, 2),
            "utf8",
        );

        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 },
        );
    }
}
