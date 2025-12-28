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
    const { val, mess } = checkRequestAuth(req);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    const products = await collectProducts();
    return NextResponse.json(JSON.parse(products));
}

export async function DELETE(req: NextRequest) {
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
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${doc?._id} - (${doc?.nazwa}) został usunięty`);
        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (e) {
        new LogService({
            kind: "error",
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
    const productData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", productData);
    try {
        const res = await updateProduct(productData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${res?._id} - (${res?.nazwa}) został zedytowany`);
        return NextResponse.json({
            status: 0,
            message: `Produkt (${res?.nazwa}) zaktualizowany`,
        });
    } catch (e) {
        console.log(e);
        new LogService({
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
    const productData = await req.json();
    try {
        const res = await createProduct(productData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Produkt: ${res?._id} został dodany`);
        return NextResponse.json(
            { status: 201, error: "Produkt został dodany" },
            { status: 201 }
        );
    } catch (e) {
        new LogService({
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
