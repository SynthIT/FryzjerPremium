import {
    collectProducts,
    createProduct,
    deleteProductBySlug,
    updateProduct,
} from "@/lib/crud/products/product";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";


export async function GET(req: NextRequest) {
    // Dla GET requestów sprawdzamy tylko, czy użytkownik jest zalogowany (ma ważny JWT)
    // Nie sprawdzamy konkretnych uprawnień - to jest tylko do wyświetlania listy produktów
    const { val } = await checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }

    try {
        const products = await collectProducts();
        const parsedProducts = JSON.parse(products);
        return NextResponse.json(Array.isArray(parsedProducts) ? parsedProducts : []);
    } catch (error) {
        console.error("Błąd podczas pobierania produktów:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug produktu do usunięcia" },
            { status: 500 }
        );
    }
    try {
        const doc = await deleteProductBySlug(slug);
        if (typeof doc === "object" && "error" in doc) {
            return NextResponse.json(
                { status: 1, error: doc.error },
                { status: 500 }
            );
        }
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${doc?._id} - (${doc?.nazwa}) został usunięty pomyślnie`);
        return NextResponse.json({ status: 0, message: "Produkt usunięty pomyślnie" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const productData = await req.json();
    try {
        const res = await updateProduct(productData);
        if (typeof res === "object" && "error" in res) {
            return NextResponse.json(
                { status: 1, error: res.error },
                { status: 500 }
            );
        }
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${res?._id} - (${res?.nazwa}) został zedytowany pomyślnie`);
        return NextResponse.json({
            status: 0,
            message: `Produkt (${res?.nazwa}) zaktualizowany`,
        });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const productData = await req.json();
    try {
        const res = await createProduct(productData);
        if (typeof res === "object" && "error" in res) {
            return NextResponse.json(
                { status: 1, error: res.error },
                { status: 500 }
            );
        }
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${res?._id} - (${res?.nazwa}) został dodany pomyślnie`);
        return NextResponse.json(
            { status: 0, message: "Produkt został dodany pomyślnie" },
            { status: 201 }
        );
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 }
        );
    }
}
