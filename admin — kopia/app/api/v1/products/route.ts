import { ProductsResponse } from "@/lib/interfaces/ax";
import { Products } from "@/lib/models/Products";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

// TODO: Po podłączeniu MongoDB, zamień to na:
// import { Product } from "@/lib/models/Products";
// import connectDB from "@/lib/db/connection";

export async function GET(req: NextRequest) {
    const url = req.url.split("/");
    const querystring =
        url[url.length - 1] != "get"
            ? url[url.length - 1].split("?")[1]
            : false;
    
    // TODO: MongoDB - zamień na:
    // await connectDB();
    // if (querystring) {
    //     const slug = querystring.split("=")[1];
    //     const product = await Product.findOne({ slug });
    //     return NextResponse.json({ status: 0, product });
    // }
    // const products = await Product.find({});
    // return NextResponse.json({ status: 0, products });
    
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

export async function PUT(req: NextRequest) {
    try {
        const product: Products = await req.json();
        
        // TODO: MongoDB - zamień na:
        // await connectDB();
        // const updatedProduct = await Product.findOneAndUpdate(
        //     { slug: product.slug },
        //     product,
        //     { new: true, runValidators: true }
        // );
        // if (!updatedProduct) {
        //     return NextResponse.json({ status: 1, error: "Produkt nie znaleziony" }, { status: 404 });
        // }
        // return NextResponse.json({ status: 0, product: updatedProduct });
        
        // Obecna implementacja z plikiem JSON
        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);
        
        const index = products.findIndex((p) => p.slug === product.slug);
        if (index === -1) {
            return NextResponse.json({ status: 1, error: "Produkt nie znaleziony" }, { status: 404 });
        }
        
        products[index] = product;
        writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
        
        return NextResponse.json({ status: 0, product });
    } catch (error) {
        console.error("Błąd podczas aktualizacji produktu:", error);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        
        if (!slug) {
            return NextResponse.json({ status: 1, error: "Brak slug produktu" }, { status: 400 });
        }
        
        // TODO: MongoDB - zamień na:
        // await connectDB();
        // const deletedProduct = await Product.findOneAndDelete({ slug });
        // if (!deletedProduct) {
        //     return NextResponse.json({ status: 1, error: "Produkt nie znaleziony" }, { status: 404 });
        // }
        // return NextResponse.json({ status: 0, message: "Produkt usunięty" });
        
        // Obecna implementacja z plikiem JSON
        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);
        
        const filteredProducts = products.filter((p) => p.slug !== slug);
        if (filteredProducts.length === products.length) {
            return NextResponse.json({ status: 1, error: "Produkt nie znaleziony" }, { status: 404 });
        }
        
        writeFileSync(filePath, JSON.stringify(filteredProducts, null, 2), "utf8");
        
        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 }
        );
    }
}
