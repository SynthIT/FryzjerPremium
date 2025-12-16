import { ProductsResponse } from "@/lib/interfaces/ax";
import { Products } from "@/lib/models/Products";
import path from "path";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.url.split("/");
    const querystring =
        url[url.length - 1] != "get"
            ? url[url.length - 1].split("?")[1]
            : false;
    const file = readFileSync(
        path.join(process.cwd(), "data", "produkty.json"),
        "utf8"
    );
    if (querystring) {
        const products: Products[] = JSON.parse(file);
        const product: Products | undefined = products.find((p) => {
            return p.slug == querystring.split("=")[1];
        });
        const response: ProductsResponse = {
            status: 0,
            product: product!,
        };
        return NextResponse.json(response);
    }
    const products: Products[] = JSON.parse(file);
    const response: ProductsResponse = {
        status: 0,
        products: products,
    };
    return NextResponse.json(response);
}
